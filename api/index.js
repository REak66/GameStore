const mongoose = require("mongoose");

let app;
let isConnected = false;

try {
  app = require("../backend/server");
} catch (loadErr) {
  app = (req, res) => res.status(500).json({ success: false, message: "Server load error: " + loadErr.message });
}

module.exports = async (req, res) => {
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ success: false, message: "MONGODB_URI is not set in environment variables" });
  }

  if (!isConnected || mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      isConnected = true;
    } catch (err) {
      return res.status(500).json({ success: false, message: "Database connection failed: " + err.message });
    }
  }

  return app(req, res);
};
