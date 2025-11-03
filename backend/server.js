import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import areaRoutes from "./routes/areas.js";
import assetRoutes from "./routes/assets.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas (ProjektNash-Pulse)"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// Routes
app.use("/api/areas", areaRoutes);
app.use("/api/assets", assetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
