import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ==========================================================
   POST /api/auth/login
   - Validates username/password
   - Blocks inactive users
   - Forces first-time password change
   - Returns JWT & safe user object
========================================================== */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("LOGIN ATTEMPT RECEIVED:", { username, password });

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const cleanUsername = username.trim().toLowerCase();

    console.log("QUERYING USER:", cleanUsername);

    // Find user (case-insensitive)
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${cleanUsername}$`, "i") }
    });

    if (!user) {
      console.log("❌ USER NOT FOUND");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔥 BLOCK INACTIVE USERS
    if (!user.active) {
      console.log("🚫 LOGIN BLOCKED — USER INACTIVE:", user.username);
      return res.status(403).json({ message: "User account is inactive" });
    }

    // Password must match
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      console.log("❌ PASSWORD MISMATCH");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ⭐ FIRST-TIME LOGIN — MUST CHANGE PASSWORD
    if (user.mustChangePassword) {
      console.log("🔐 FIRST-TIME LOGIN — FORCE PASSWORD RESET:", user.username);

      return res.status(403).json({
        message: "Password change required",
        mustChangePassword: true,
        userId: user._id
      });
    }

    // ⭐ Normal Login → Issue JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "8h" }
    );

    const safeUser = {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      allowedModules: user.allowedModules,
    };

    console.log("✅ LOGIN SUCCESS:", safeUser.username);

    return res.json({ user: safeUser, token });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

export default router;
