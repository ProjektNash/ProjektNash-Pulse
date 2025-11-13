import express from "express";
import Settings from "../models/Setting.js";

const router = express.Router();

/* ===========================================
   GET GLOBAL SETTINGS
=========================================== */
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // If no settings exist yet, create default
    if (!settings) {
      settings = await Settings.create({ inflationRate: 0 });
    }

    res.json(settings);
  } catch (err) {
    console.error("❌ Error fetching settings:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ===========================================
   UPDATE GLOBAL SETTINGS
=========================================== */
router.put("/", async (req, res) => {
  try {
    const { inflationRate } = req.body;

    const updated = await Settings.findOneAndUpdate(
      {},
      { inflationRate, lastUpdated: new Date() },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating settings:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
