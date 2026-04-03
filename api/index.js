const mongoose = require("mongoose");

// Must be set before any models are loaded so schemas inherit this setting.
mongoose.set("bufferCommands", false);

const CONNECT_OPTS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 10000,
};

const connectDB = async () => {
  const state = mongoose.connection.readyState;
  if (state === 1) return; // already connected
  // If connecting, wait for it to finish
  if (state === 2) {
    await mongoose.connection.asPromise();
    return;
  }
  // Disconnected — create a fresh connection
  await mongoose.connect(process.env.MONGODB_URI, CONNECT_OPTS);
};

// Load app once; module cache persists across warm invocations in the same instance.
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
    return res.status(500).json({
      success: false,
      message: "DB connection failed: " + err.message,
      readyState: mongoose.connection.readyState,
    });
  }
  return app(req, res);
};
