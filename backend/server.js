import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// --- Import Routes ---
import areaRoutes from "./routes/areas.js";
import assetRoutes from "./routes/assets.js";
import partnerRoutes from "./routes/partners.js";
import maintenanceRoutes from "./routes/maintenance.js";
import settingsRoutes from "./routes/settings.js";
import formulaRoutes from "./routes/formulas.js";   // ⭐ Formulas Module

// ⭐ NEW — Authentication & User Management
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

dotenv.config();
const app = express();

// ======================================================
// ✅ CORS – allow local dev + GitHub Pages frontend
// ======================================================
app.use(
  cors({
    origin: [
      "https://projektnash.github.io", // Live frontend
      "http://localhost:5173",         // Local dev frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ======================================================
// ✅ BODY SIZE LIMIT — REQUIRED FOR PHOTO UPLOADS
// ======================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ======================================================
// ✅ MongoDB Connection
// ======================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas (ProjektNash-Pulse)"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ======================================================
// ✅ API Routes
// ======================================================
app.use("/api/auth", authRoutes);       // ⭐ Login
app.use("/api/users", userRoutes);      // ⭐ Admin user management

app.use("/api/areas", areaRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/formulas", formulaRoutes);   // ⭐ Formula Builder API

// ❤️ Health check
app.get("/", (req, res) => {
  res.send("🚀 ProjektNash-Pulse Backend API is running...");
});

// ======================================================
// ✅ Start Server
// ======================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
