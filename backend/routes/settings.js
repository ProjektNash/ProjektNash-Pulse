import express from "express";
import Setting from "../models/Setting.js";
import Asset from "../models/Asset.js";

const router = express.Router();

/* ----------------------------------------------------------
   Default inflation table
---------------------------------------------------------- */
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

/* ----------------------------------------------------------
   Ensure a Settings document always exists
---------------------------------------------------------- */
async function getOrCreateSettings() {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting({
      inflationRate: 0,
      defaultInflationRate: 0,
      inflationTable: DEFAULT_INFLATION_TABLE,
    });
    await settings.save();
  }
  return settings;
}

/* ----------------------------------------------------------
   Helper: get inflation rate for a year
---------------------------------------------------------- */
function getRateForYear(year, settings) {
  const row = settings.inflationTable.find(r => r.year === year);
  if (row) return Number(row.rate);

  return Number(settings.defaultInflationRate);
}

/* ----------------------------------------------------------
   Rebuild history for a single asset
---------------------------------------------------------- */
function rebuildHistory(asset, settings) {
  const currentYear = new Date().getFullYear();
  const baseCost = asset.purchaseCost || 0;

  let baseYear = currentYear;

  // Work out purchase year
  if (asset.purchaseDate) {
    let parsed;
    if (/^\d{4}$/.test(asset.purchaseDate)) {
      parsed = new Date(`${asset.purchaseDate}-01-01`);
    } else {
      parsed = new Date(asset.purchaseDate);
    }
    if (!isNaN(parsed)) baseYear = parsed.getFullYear();
  } else {
    baseYear = new Date(asset.createdAt).getFullYear();
  }

  if (baseYear > currentYear) baseYear = currentYear;

  const history = [];
  let year = baseYear;
  let value = baseCost;

  // Base year
  history.push({
    year,
    inflationRate: 0,
    value: Number(value.toFixed(2)),
  });

  // Following years
  while (year < currentYear) {
    year++;
    const rate = getRateForYear(year, settings);
    value = value * (1 + rate / 100);

    history.push({
      year,
      inflationRate: rate,
      value: Number(value.toFixed(2)),
    });
  }

  return history;
}

/* ----------------------------------------------------------
   GET /api/settings
---------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load settings" });
  }
});

/* ----------------------------------------------------------
   PUT /api/settings — Save + Recalculate ALL Assets
---------------------------------------------------------- */
router.put("/", async (req, res) => {
  try {
    let settings = await getOrCreateSettings();

    const { inflationTable, defaultInflationRate } = req.body;

    // Update inflation table
    if (Array.isArray(inflationTable)) {
      settings.inflationTable = inflationTable
        .map(r => ({
          year: Number(r.year),
          rate: Number(r.rate),
        }))
        .sort((a, b) => a.year - b.year);
    }

    // Update default rate
    settings.defaultInflationRate = Number(defaultInflationRate) || 0;

    await settings.save();

    // Recalculate *all* assets
    const assets = await Asset.find();
    let updatedCount = 0;

    for (const asset of assets) {
      asset.valueHistory = rebuildHistory(asset, settings);
      await asset.save();
      updatedCount++;
    }

    res.json({
      message: "Settings updated. All assets recalculated.",
      updatedAssets: updatedCount,
      settings,
    });

  } catch (err) {
    console.error("❌ Error updating settings:", err);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

export default router;

