const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/shopping_db";

const users = [
  {
    name: "ReakAdmin",
    email: "tharyvireak1@yahoo.com",
    password: "reakzyy6",
    role: "admin",
    phone: "012345678",
    isActive: true,
  },
  {
    name: "Test User",
    email: "user@example.com",
    password: "User@123",
    role: "customer",
    phone: "098765432",
    isActive: true,
  },
  {
    name: "Admin",
    email: "admin@demo.com",
    password: "password123",
    role: "admin",
    isActive: true,
  },
  {
    name: "Customer",
    email: "customer@demo.com",
    password: "password123",
    role: "customer",
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    for (const userData of users) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`  Skipped (already exists): ${userData.email}`);
        continue;
      }
      const user = new User(userData);
      await user.save();
      console.log(`  Created [${user.role}]: ${user.email}`);
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
