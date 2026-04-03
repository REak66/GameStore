const mongoose = require("mongoose");
const app = require("../backend/server");

// Reuse MongoDB connection across serverless invocations
let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
  }
  return app(req, res);
};
