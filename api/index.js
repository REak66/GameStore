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

  // In Mongoose 8 a connection that was previously established and then
  // dropped (by Atlas idle timeout) must be explicitly closed before
  // connect() will open a fresh one. Without this, connect() resolves
  // the promise immediately but leaves readyState at 0.
  if (state !== 0) {
    // state 2 = connecting, 3 = disconnecting — wait or close it first
    try { await mongoose.disconnect(); } catch (_) { /* ignore */ }
  } else if (mongoose.connection.client) {
    // State 0 but a previous MongoClient exists (stale) — close it
    try { await mongoose.disconnect(); } catch (_) { /* ignore */ }
  }

  await mongoose.connect(process.env.MONGODB_URI, CONNECT_OPTS);

  if (mongoose.connection.readyState !== 1) {
    throw new Error(
      `MongoDB connect() resolved but readyState=${mongoose.connection.readyState}`
    );
  }
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
  const stateBefore = mongoose.connection.readyState;
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "DB connection failed: " + err.message,
      stateBefore,
      stateAfter: mongoose.connection.readyState,
    });
  }
  return app(req, res);
};
