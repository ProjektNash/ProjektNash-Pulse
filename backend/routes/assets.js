import express from "express";
import Asset from "../models/Asset.js";
import Settings from "../models/Setting.js";

const router = express.Router();

/* ==========================================================
   Helpers for Settings + Inflation
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
      inflationRate: 2,
      defaultInflationRate: 2,
      inflationTable: DEFAULT_INFLATION_TABLE,
    });
    await settings.save();
  }
  return settings;
}

function sortHistory(history = []) {
  return [...history].sort((a, b) => a.year - b.year);
}

function recomputeHistoryValues(history, startIndex, baseCost) {
  const sorted = sortHistory(history);

  for (let i = startIndex; i < sorted.length; i++) {
    const prevValue = i === 0 ? (baseCost || 0) : sorted[i - 1].value || 0;
    const rate = sorted[i].inflationRate || 0;
    const newValue = prevValue * (1 + rate / 100);
    sorted[i].value = Number(newValue.toFixed(2));
  }

  return sorted;
}

/* Get default rate for a given year from Settings */
function getRateForYear(year, settings) {
  const table = settings?.inflationTable || [];
  const found = table.find((r) => r.year === year);
  if (found && typeof found.rate === "number") return found.rate;

  // fallback to defaultInflationRate or legacy inflationRate
  if (
    settings &&
    typeof settings.defaultInflationRate === "number" &&
    !Number.isNaN(settings.defaultInflationRate)
  ) {
    return settings.defaultInflationRate;
  }
  if (
    settings &&
    typeof settings.inflationRate === "number" &&
    !Number.isNaN(settings.inflationRate)
  ) {
    return settings.inflationRate;
  }
  return 0;
}

/* ==========================================================
   🔹 GET all assets (build valueHistory using per-year rates)
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

        // ---- Purchase year detection ----
        let baseYear = currentYear;
        if (asset.purchaseDate) {
          let py;
          if (/^\d{4}$/.test(asset.purchaseDate)) {
            py = new Date(`${asset.purchaseDate}-01-01`);
          } else {
            py = new Date(asset.purchaseDate);
          }
          if (!Number.isNaN(py)) {
            baseYear = py.getFullYear();
          }
        } else if (asset.createdAt) {
          baseYear = new Date(asset.createdAt).getFullYear();
        }
        if (baseYear > currentYear) baseYear = currentYear;

        let history = sortHistory(asset.valueHistory || []);

        const expectedYears = currentYear - baseYear + 1;
        const historyStart = history.length ? history[0].year : null;
        const historyEnd = history.length
          ? history[history.length - 1].year
          : null;

        const historyIsIncomplete =
          history.length === 0 ||
          history.length !== expectedYears ||
          historyStart !== baseYear ||
          historyEnd !== currentYear;

        if (historyIsIncomplete) {
          // 🔧 Rebuild full history using per-year rates
          const newHistory = [];
          let year = baseYear;
          let lastValue = baseCost;

          // base year: 0% inflation
          newHistory.push({
            year,
            inflationRate: 0,
            value: Number(lastValue.toFixed(2)),
          });

          while (year < currentYear) {
            year++;
            const rateForYear = getRateForYear(year, settings);
            lastValue = lastValue * (1 + rateForYear / 100);

            newHistory.push({
              year,
              inflationRate: rateForYear,
              value: Number(lastValue.toFixed(2)),
            });
          }

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
    console.error("❌ Error fetching assets:", err);
    res.status(500).json({ error: "Failed to load assets" });
  }
});

/* ==========================================================
   CREATE asset
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
   UPDATE asset
========================================================== */
router.put("/:id", async (req, res) => {
  try {
    delete req.body._id;
    delete req.body.assetCode;

    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json({ message: "Asset updated", asset: updated });
  } catch (err) {
    console.error("❌ Error updating asset:", err);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

/* ==========================================================
   UPDATE value history for specific year (manual override)
========================================================== */
router.put("/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    let { year, inflationRate } = req.body;

    year = Number(year);
    inflationRate = Number(inflationRate);

    if (!year || Number.isNaN(year)) {
      return res.status(400).json({ error: "Valid 'year' is required" });
    }
    if (Number.isNaN(inflationRate)) {
      return res
        .status(400)
        .json({ error: "Valid 'inflationRate' is required" });
    }

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    const baseCost = asset.purchaseCost || 0;
    let history = sortHistory(asset.valueHistory || []);

    if (!history.length) {
      return res
        .status(400)
        .json({ error: "No value history exists for this asset yet." });
    }

    const idx = history.findIndex((h) => h.year === year);
    if (idx === -1) {
      return res.status(404).json({ error: `Year ${year} not found` });
    }

    // Manual override
    history[idx].inflationRate = inflationRate;
    history = recomputeHistoryValues(history, idx, baseCost);

    asset.valueHistory = history;
    await asset.save();

    const latest = history[history.length - 1];

    res.json({
      message: "History updated",
      asset: {
        ...asset.toObject(),
        latestInflatedValue: latest?.value ?? null,
        latestInflationRate: latest?.inflationRate ?? null,
      },
    });
  } catch (err) {
    console.error("❌ Error updating history:", err);
    res.status(500).json({ error: "Failed to update history" });
  }
});

/* ==========================================================
   DELETE asset
========================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Asset.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json({ message: "Asset deleted" });
  } catch (err) {
    console.error("❌ Error deleting asset:", err);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

export default router;
