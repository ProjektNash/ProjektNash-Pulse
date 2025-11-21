import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ username: "admin" });

    if (existing) {
      console.log("⚠️ Admin user already exists!");
      console.log(existing);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("admin123", 10);

    const adminUser = new User({
      username: "admin",
      displayName: "Administrator",
      passwordHash,
      role: "admin",
      allowedModules: [
        "dashboard",
        "safety",
        "assets",
        "businessPartners",
        "maintenance",
        "preventiveMaintenance",
        "maintenanceCalendar",
        "digitalLabBook"
      ],
    });

    await adminUser.save();

    console.log("🎉 Admin user created successfully!");
    console.log("👉 username: admin");
    console.log("👉 password: admin123");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

createAdmin();
