const mongoose = require("mongoose");

// Disable command buffering - fail immediately if not connected
mongoose.set("bufferCommands", false);

let connectionPromise = null;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 25000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 25000,
      })
      .catch((err) => {
        connectionPromise = null;
        throw err;
      });
  }
  return connectionPromise;
};

let app;
try {
  app = require("../backend/server");
} catch (loadErr) {
  app = (req, res) =>
    res.status(500).json({ success: false, message: "Server load error: " + loadErr.message });
}

module.exports = async (req, res) => {
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ success: false, message: "MONGODB_URI is not set" });
  }
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ success: false, message: "DB connection failed: " + err.message });
  }
  return app(req, res);
};
