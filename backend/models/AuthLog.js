const mongoose = require("mongoose");

const authLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String },
    action: { type: String, enum: ["login", "logout", "failed"], required: true },
    ip: { type: String },
    userAgent: { type: String },
    deviceType: { type: String },
    os: { type: String },
    browser: { type: String },
    success: { type: Boolean },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { bufferCommands: false },
);

authLogSchema.index({ createdAt: -1 });
authLogSchema.index({ user: 1, createdAt: -1 });
authLogSchema.index({ action: 1, success: 1 });
authLogSchema.index({ email: 1 });

module.exports = mongoose.model("AuthLog", authLogSchema);
