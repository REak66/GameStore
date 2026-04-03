const mongoose = require("mongoose");

const authLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String },
  action: { type: String, enum: ["login", "logout", "failed"], required: true },
  ip: { type: String },
  userAgent: { type: String },
  deviceType: { type: String }, // e.g. 'desktop', 'mobile', 'tablet', 'bot', 'unknown'
  os: { type: String }, // e.g. 'Windows', 'macOS', 'iOS', 'Android', etc.
  browser: { type: String }, // e.g. 'Chrome', 'Firefox', 'Safari', etc.
  success: { type: Boolean },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AuthLog", authLogSchema);
