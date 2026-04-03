const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const AuthLog = require("./models/AuthLog");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/shopping_db";

const sampleLogs = [
  {
    email: "admin@demo.com",
    action: "login",
    ip: "192.168.1.10",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    deviceType: "desktop",
    os: "Windows",
    browser: "Chrome",
    success: true,
    message: "Login successful",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    email: "customer@demo.com",
    action: "login",
    ip: "192.168.1.11",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    deviceType: "mobile",
    os: "iOS",
    browser: "Safari",
    success: true,
    message: "Login successful",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    email: "user@example.com",
    action: "login",
    ip: "192.168.1.12",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
    deviceType: "desktop",
    os: "macOS",
    browser: "Safari",
    success: false,
    message: "Invalid credentials",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    email: "admin@demo.com",
    action: "login",
    ip: "192.168.1.13",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    deviceType: "mobile",
    os: "Android",
    browser: "Chrome",
    success: true,
    message: "Login successful",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
];

async function seedAuthLogs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    for (const log of sampleLogs) {
      const user = await User.findOne({ email: log.email });
      if (user) log.user = user._id;
      await AuthLog.create(log);
      console.log(
        `Seeded log for ${log.email} (${log.deviceType}, ${log.os}, ${log.browser})`,
      );
    }
    console.log("Auth log seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seedAuthLogs();
