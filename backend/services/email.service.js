const nodemailer = require('nodemailer');
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });

/**
 * Sends a password-reset email with a secure link.
 * @param {string} toEmail  – Recipient address
 * @param {string} resetToken – Plain-text reset token (NOT the hashed one)
 */
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.GMAIL_FROM,
    to: toEmail,
    subject: 'Password Reset Request – GameShop',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#6c63ff;">Reset Your Password</h2>
        <p>You requested a password reset for your GameShop account.</p>
        <p>Click the button below to choose a new password. This link expires in <strong>10 minutes</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#6c63ff;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
          Reset Password
        </a>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break:break-all;color:#555;">${resetUrl}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#999;font-size:12px;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
      </div>
    `,
  });
};

/**
 * Sends a welcome email after successful registration.
 * @param {string} toEmail
 * @param {string} name
 */
exports.sendWelcomeEmail = async (toEmail, name) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.GMAIL_FROM,
    to: toEmail,
    subject: 'Welcome to GameShop!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#6c63ff;">Welcome, ${name}!</h2>
        <p>Thanks for creating a GameShop account. You're all set to browse and buy your favourite games.</p>
        <a href="${process.env.CLIENT_URL}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#6c63ff;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
          Start Shopping
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#999;font-size:12px;">You are receiving this email because you registered at GameShop.</p>
      </div>
    `,
  });
};
