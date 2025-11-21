import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { authRequired, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================================
   GET /api/users  (Admin only)
========================================================== */
router.get("/", authRequired, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ username: 1 });

    const safeUsers = users.map((u) => ({
      id: u._id,
      username: u.username,
      displayName: u.displayName,
      role: u.role,
      allowedModules: u.allowedModules,
      active: u.active,
      mustChangePassword: u.mustChangePassword,
      createdAt: u.createdAt,
    }));

    res.json(safeUsers);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ==========================================================
   POST /api/users  (Admin only)
========================================================== */
router.post("/", authRequired, requireAdmin, async (req, res) => {
  try {
    const { username, displayName, password, role, allowedModules } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      username: username.trim(),
      displayName: displayName?.trim() || username.trim(),
      passwordHash,
      role: role === "admin" ? "admin" : "user",
      allowedModules: Array.isArray(allowedModules) ? allowedModules : [],
      mustChangePassword: true,   // ⭐ FIRST-TIME LOGIN REQUIRED
    });

    await user.save();

    const safeUser = {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      allowedModules: user.allowedModules,
      active: user.active,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    };

    res.status(201).json(safeUser);
  } catch (err) {
    console.error("Failed to create user:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

/* ==========================================================
   PUT /api/users/:id/modules  (Admin only)
========================================================== */
router.put("/:id/modules", authRequired, requireAdmin, async (req, res) => {
  try {
    const { allowedModules } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.allowedModules = Array.isArray(allowedModules) ? allowedModules : [];
    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      allowedModules: user.allowedModules,
      active: user.active,
    });
  } catch (err) {
    console.error("Failed to update user modules:", err);
    res.status(500).json({ message: "Failed to update modules" });
  }
});

/* ==========================================================
   PUT /api/users/:id/basic  (Admin only)
========================================================== */
router.put("/:id/basic", authRequired, requireAdmin, async (req, res) => {
  try {
    const { role, displayName, active } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (role && ["admin", "user"].includes(role)) user.role = role;
    if (typeof displayName === "string") user.displayName = displayName.trim();
    if (typeof active === "boolean") user.active = active;

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      allowedModules: user.allowedModules,
      active: user.active,
      mustChangePassword: user.mustChangePassword,
    });
  } catch (err) {
    console.error("Failed to update user:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

/* ==========================================================
   PUT /api/users/:id/set-password
   - Used for first-time login AND settings page
   - DOES NOT require admin
========================================================== */
router.put("/:id/set-password", async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false; // ⭐ User can now log in normally
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Failed to update password" });
  }
});

/* ==========================================================
   PUT /api/users/:id/password  (Admin overrides password)
========================================================== */
router.put("/:id/password", authRequired, requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = true; // ⭐ Admin resets → force user to set own password
    await user.save();

    res.json({ message: "Password reset by admin" });
  } catch (err) {
    console.error("Failed to update password:", err);
    res.status(500).json({ message: "Failed to update password" });
  }
});

/* ==========================================================
   DELETE /api/users/:id  (Admin only)
========================================================== */
router.delete("/:id", authRequired, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.deleteOne({ _id: req.params.id });

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Failed to delete user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
