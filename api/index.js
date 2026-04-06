const path = require("path");
const { createRequire } = require("module");

// backend/server.js and all its models resolve "mongoose" from the backend
// directory. We must use that SAME singleton — otherwise connectDB() and the
// model queries operate on two completely different Mongoose instances (one
// connected, one not), causing the "buffering timed out / bufferCommands=false"
// errors. createRequire lets us resolve a module as if we were inside server.js.
const backendRequire = createRequire(
  path.resolve(__dirname, "../backend/server.js")
);
const mongoose = backendRequire("mongoose");

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

  if (state === 2) {
    // Another invocation is already connecting — wait for it instead of
    // disconnecting it (which causes "readyState=2" errors).
    await new Promise((resolve, reject) => {
      mongoose.connection.once("connected", resolve);
      mongoose.connection.once("error", reject);
    });
    return;
  }

  // state 3 (disconnecting) or state 0 with a stale client — close first.
  if (state !== 0 || mongoose.connection.client) {
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
