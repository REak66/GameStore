const mongoose = require("mongoose");

// Must be set before any models are loaded so schemas inherit this setting.
// Queries fail immediately if no connection instead of buffering for 10 s.
mongoose.set("bufferCommands", false);

const CONNECT_OPTS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 10000,
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  // If currently connecting, wait for the connection event directly —
  // do NOT rely solely on the mongoose.connect() promise which can resolve
  // slightly before readyState reaches 1 in some edge cases.
  const waitForReady = () =>
    new Promise((resolve, reject) => {
      // Already connected by the time we set up listeners
      if (mongoose.connection.readyState === 1) return resolve();

      const onConnected = () => {
        mongoose.connection.removeListener("error", onError);
        resolve();
      };
      const onError = (err) => {
        mongoose.connection.removeListener("connected", onConnected);
        reject(err);
      };
      mongoose.connection.once("connected", onConnected);
      mongoose.connection.once("error", onError);
    });

  if (mongoose.connection.readyState !== 2) {
    // Not yet connecting — kick off connect() and wait for 'connected' event
    mongoose.connect(process.env.MONGODB_URI, CONNECT_OPTS).catch(() => {
      // errors are surfaced via the 'error' event caught in waitForReady
    });
  }

  await waitForReady();

  if (mongoose.connection.readyState !== 1) {
    throw new Error(
      `MongoDB not ready after connect (readyState=${mongoose.connection.readyState})`
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
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ success: false, message: "DB connection failed: " + err.message });
  }
  return app(req, res);
};
