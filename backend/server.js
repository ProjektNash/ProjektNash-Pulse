import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// --- Import Routes ---
import areaRoutes from "./routes/areas.js";
import assetRoutes from "./routes/assets.js";
import partnerRoutes from "./routes/partners.js";     
import maintenanceRoutes from "./routes/maintenance.js";
import settingsRoutes from "./routes/settings.js";   // ⭐ ADDED — Settings route

dotenv.config();
const app = express();

// ✅ Configure CORS to allow both local dev and deployed frontend
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

// ✅ Middleware
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas (ProjektNash-Pulse)"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ✅ API Routes
app.use("/api/areas", areaRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/settings", settingsRoutes);  // ⭐ ADDED — Global Settings API

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("🚀 ProjektNash-Pulse Backend API is running...");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
