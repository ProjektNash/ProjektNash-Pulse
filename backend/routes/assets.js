import express from "express";
import Asset from "../models/Asset.js";
import Settings from "../models/Setting.js";

const router = express.Router();

/* ==========================================================
   SETTINGS HELPERS
========================================================== */

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

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({
      defaultInflationRate: 2,
      inflationTable: DEFAULT_INFLATION_TABLE,
    });
    await settings.save();
  }
  return settings;
}

/* ==========================================================
   HISTORY HELPERS
========================================================== */

function sortHistory(history = []) {
  return [...history].sort((a, b) => a.year - b.year);
}

function getRateForYear(year, settings) {
  const table = settings?.inflationTable || [];
  const row = table.find((r) => r.year === year);
  if (row) return Number(row.rate);

  return Number(settings.defaultInflationRate || 0);
}

function rebuildHistory(asset, settings) {
  const currentYear = new Date().getFullYear();
  const baseCost = asset.purchaseCost || 0;

  // Detect purchase year
  let baseYear = currentYear;

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

  // Base year — no inflation
  history.push({
    year,
    inflationRate: 0,
    value: Number(value.toFixed(2)),
  });

  // Future years
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

/* ==========================================================
   🔹 GET ALL ASSETS
========================================================== */
router.get("/", async (req, res) => {
  try {
    const { areaId } = req.query;

    const filter = areaId ? { areaId } : {};
    const assets = await Asset.find(filter).sort({ createdAt: -1 });

    const settings = await getOrCreateSettings();
    const currentYear = new Date().getFullYear();

    const adjustedAssets = await Promise.all(
      assets.map(async (asset) => {
        const baseCost = asset.purchaseCost || 0;

        // --- Detect purchase year ---
        let baseYear = currentYear;

        if (asset.purchaseDate) {
          let parsed;

          if (/^\d{4}$/.test(asset.purchaseDate)) {
            parsed = new Date(`${asset.purchaseDate}-01-01`);
          } else {
            parsed = new Date(asset.purchaseDate);
          }

          if (!isNaN(parsed)) baseYear = parsed.getFullYear();
        } else if (asset.createdAt) {
          baseYear = new Date(asset.createdAt).getFullYear();
        }

        if (baseYear > currentYear) baseYear = currentYear;

        let history = sortHistory(asset.valueHistory || []);

        const expectedYears = currentYear - baseYear + 1;
        const historyIsInvalid =
          history.length !== expectedYears ||
          (history.length && history[0].year !== baseYear) ||
          (history.length && history[history.length - 1].year !== currentYear);

        // Rebuild if missing or wrong
        if (historyIsInvalid) {
          const newHistory = rebuildHistory(asset, settings);
          asset.valueHistory = newHistory;
          history = newHistory;
          await asset.save();
        }

        const latest = history[history.length - 1];

        return {
          ...asset.toObject(),
          latestInflatedValue: latest?.value ?? null,
          latestInflationRate: latest?.inflationRate ?? null,
        };
      })
    );

    res.json(adjustedAssets);
  } catch (err) {
    console.error("❌ Error loading assets:", err);
    res.status(500).json({ error: "Failed to load assets" });
  }
});

/* ==========================================================
   🔹 CREATE ASSET
========================================================== */
router.post("/", async (req, res) => {
  try {
    delete req.body._id;
    delete req.body.assetCode;

    const newAsset = new Asset(req.body);
    await newAsset.save();

    res.json({ message: "Asset created successfully", asset: newAsset });
  } catch (err) {
    console.error("❌ Error creating asset:", err);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

/* ==========================================================
   🔹 UPDATE ASSET
========================================================== */
router.put("/:id", async (req, res) => {
  try {
    delete req.body._id;
    delete req.body.assetCode;

    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ error: "Asset not found" });

    res.json({ message: "Asset updated", asset: updated });
  } catch (err) {
    console.error("❌ Error updating asset:", err);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

/* ==========================================================
   🔹 MANUAL OVERRIDE — update one year in history
========================================================== */
router.put("/:id/history", async (req, res) => {
  try {
    return res.status(400).json({
      error:
        "Manual inflation editing is disabled. All inflation now comes from Settings.",
    });
  } catch (err) {
    console.error("❌ Error updating history:", err);
    res.status(500).json({ error: "Failed to update history" });
  }
});

/* ==========================================================
   🔹 DELETE ASSET
========================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Asset.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Asset not found" });

    res.json({ message: "Asset deleted" });
  } catch (err) {
    console.error("❌ Error deleting asset:", err);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

export default router;
