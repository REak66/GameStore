const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = () => {
  const state = mongoose.connection.readyState;
  // 1 = connected
  if (state === 1) return Promise.resolve();
  // 2 = connecting — reuse in-flight promise
  if (state === 2 && connectionPromise) return connectionPromise;
  // 0 = disconnected, 3 = disconnecting — reset and reconnect
  connectionPromise = null;
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
