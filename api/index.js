const mongoose = require("mongoose");

// Must be set before any models are loaded so schemas inherit this setting.
// Queries fail immediately if no connection instead of buffering for 10 s.
mongoose.set("bufferCommands", false);

let connectionPromise = null;

const connectDB = () => {
  const state = mongoose.connection.readyState;
  // 1 = connected
  if (state === 1) return Promise.resolve();
  // 2 = connecting — reuse in-flight promise so we don't open a second connection
  if (state === 2 && connectionPromise) return connectionPromise;
  // 0 = disconnected, 3 = disconnecting — always create a fresh connection
  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
    })
    .catch((err) => {
      connectionPromise = null;
      throw err;
    });
  return connectionPromise;
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
    return res.status(500).json({ success: false, message: "DB connection failed: " + err.message });
  }
  return app(req, res);
};
