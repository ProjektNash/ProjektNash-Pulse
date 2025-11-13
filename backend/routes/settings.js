import express from "express";
import Setting from "../models/Setting.js";

const router = express.Router();

/* ---------------------------------------------
   Default inflation table (you can edit later)
   – rough UK-style yearly rates, adjustable
--------------------------------------------- */
const DEFAULT_INFLATION_TABLE = [
  { year: 2015, rate: 0.0 },
  { year: 2016, rate: 1.0 },
  { year: 2017, rate: 2.7 },
  { year: 2018, rate: 2.5 },
  { year: 2019, rate: 1.8 },
  { year: 2020, rate: 1.4 },
  { year: 2021, rate: 2.0 },
  { year: 2022, rate: 9.1 },
  { year: 2023, rate: 6.8 },
  { year: 2024, rate: 3.0 },
  { year: 2025, rate: 2.5 },
];

/* ---------------------------------------------
   Helper: get or create single settings doc
--------------------------------------------- */
async function getOrCreateSettings() {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting({
      inflationRate: 2, // legacy / fallback
      defaultInflationRate: 2,
      inflationTable: DEFAULT_INFLATION_TABLE,
    });
    await settings.save();
  }
  return settings;
}

/* ==========================================================
   GET /api/settings
   – returns settings (and creates defaults if needed)
========================================================== */
router.get("/", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    console.error("❌ Error loading settings:", err);
    res.status(500).json({ error: "Failed to load settings" });
  }
});

/* ==========================================================
   PUT /api/settings
   – update inflation table / default rate
========================================================== */
router.put("/", async (req, res) => {
  try {
    let settings = await getOrCreateSettings();

    const { inflationTable, defaultInflationRate } = req.body;

    if (Array.isArray(inflationTable)) {
      settings.inflationTable = inflationTable
        .map((row) => ({
          year: Number(row.year),
          rate: Number(row.rate),
        }))
        .filter((row) => !Number.isNaN(row.year) && !Number.isNaN(row.rate))
        .sort((a, b) => a.year - b.year);
    }

    if (
      defaultInflationRate !== undefined &&
      !Number.isNaN(Number(defaultInflationRate))
    ) {
      settings.defaultInflationRate = Number(defaultInflationRate);
    }

    await settings.save();
    res.json({ message: "Settings updated", settings });
  } catch (err) {
    console.error("❌ Error updating settings:", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
