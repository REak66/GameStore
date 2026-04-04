const User = require("../models/User");
const AuthLog = require("../models/AuthLog");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UAParser = require("ua-parser-js");
const { sendPasswordResetEmail, sendWelcomeEmail } = require("../services/email.service");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1h",
  });

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const EMAIL_MAX_LENGTH = 255;

/** Returns a validation error message for the given email, or null if valid. */
const validateEmail = (email) => {
  if (!email) return "Email must not be empty";
  if (email.length > EMAIL_MAX_LENGTH) return "Email must not exceed 255 characters";
  if (!EMAIL_REGEX.test(email)) return "Must follow email format (example: example@gmail.com)";
  return null;
};

const getClientInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const uaResult = new UAParser(userAgent).getResult();
  return {
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    userAgent,
    deviceType: uaResult.device.type || "desktop",
    os: uaResult.os.name || "unknown",
    browser: uaResult.browser.name || "unknown",
  };
};

const writeAuthLog = (data) => { AuthLog.create(data).catch(() => {}); };

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailError = validateEmail(email);
    if (emailError)
      return res.status(400).json({ success: false, message: emailError });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists in database" });
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    // Send welcome email (non-blocking – failure should not break registration)
    sendWelcomeEmail(user.email, user.name).catch((err) =>
      console.error('Welcome email failed:', err.message),
    );
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const clientInfo = getClientInfo(req);
  const baseLog = { email, action: "login", ...clientInfo };

  try {
    const emailError = validateEmail(email);
    if (emailError) {
      await writeAuthLog({ ...baseLog, success: false, message: emailError });
      return res.status(400).json({ success: false, message: emailError });
    }
    if (!password) {
      await writeAuthLog({ ...baseLog, success: false, message: "Please provide password" });
      return res.status(400).json({ success: false, message: "Please provide password" });
    }
    // Account Check
    const user = await User.findOne({ email }).select("+password +loginAttempts +lockUntil");
    if (!user) {
      await writeAuthLog({ ...baseLog, success: false, message: "Email does not exist in system" });
      return res.status(404).json({ success: false, message: "Email does not exist in system" });
    }

    // Lockout check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const secondsLeft = Math.ceil((user.lockUntil - Date.now()) / 1000);
      const msg = `Too many failed attempts. Please try again in ${secondsLeft} second(s).`;
      await writeAuthLog({ ...baseLog, user: user._id, success: false, message: msg });
      return res.status(429).json({ success: false, message: msg });
    }

    if (!(await user.matchPassword(password))) {
      const attempts = (user.loginAttempts || 0) + 1;
      const update = { loginAttempts: attempts };
      if (attempts >= 3) {
        update.lockUntil = new Date(Date.now() + 1 * 60 * 1000); // lock 1 minute
        update.loginAttempts = 0;
      }
      await User.updateOne({ _id: user._id }, update);
      const attemptsLeft = attempts < 3 ? 3 - attempts : 0;
      const msg = attempts >= 3
        ? "Too many failed attempts. Account locked for 1 minute."
        : `Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.`;
      await writeAuthLog({ ...baseLog, user: user._id, success: false, message: msg });
      return res.status(401).json({ success: false, message: msg });
    }

    if (!user.isActive) {
      await writeAuthLog({ ...baseLog, user: user._id, success: false, message: "Account is deactivated" });
      return res.status(401).json({ success: false, message: "Account is deactivated" });
    }

    // Reset lockout on successful login
    await User.updateOne({ _id: user._id }, { loginAttempts: 0, lockUntil: null });
    const token = generateToken(user._id);
    await writeAuthLog({ ...baseLog, user: user._id, success: true, message: "Login successful" });
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone, address: user.address },
    });
  } catch (err) {
    await writeAuthLog({ ...baseLog, success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const clientInfo = getClientInfo(req);
    const reason = req.body?.reason;
    const message = reason === "auto"
      ? "Session expired (auto sign-out)"
      : "Logout successful";
    await writeAuthLog({
      user: req.user._id,
      email: req.user.email,
      action: "logout",
      ...clientInfo,
      success: true,
      message,
    });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true },
    );
    res.json({ success: true, user });
  } catch (err) {
    const status = err.name === 'ValidationError' ? 400 : 500;
    const message = err.name === 'ValidationError'
      ? Object.values(err.errors).map((e) => e.message).join(', ')
      : err.message;
    res.status(status).json({ success: false, message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendPasswordResetEmail(user.email, resetToken);
    res.json({ success: true, message: "Password reset email sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = generateToken(user._id);
    res.json({ success: true, token, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }
    // On Vercel, multer uses memoryStorage so req.file.buffer holds the bytes.
    // Store as a base64 data URL directly in MongoDB (no ephemeral /tmp disk needed).
    const avatarUrl = req.file.buffer
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
      : `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true },
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
