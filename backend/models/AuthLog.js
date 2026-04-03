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

module.exports = mongoose.model("AuthLog", authLogSchema);
