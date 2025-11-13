import express from "express";
import Asset from "../models/Asset.js";
import Settings from "../models/Setting.js";

const router = express.Router();

/* ==========================================================
   🔹 Helper: sort history by year
========================================================== */
function sortHistory(history = []) {
  return [...history].sort((a, b) => a.year - b.year);
}

/* ==========================================================
   🔹 Helper: recompute values from a given index onward
   - Uses purchaseCost as the base for year 0
========================================================== */
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

/* ==========================================================
   🔹 GET all assets (backfill OR rebuild valueHistory)
========================================================== */
router.get("/", async (req, res) => {
  try {
    const { areaId } = req.query;
    const filter = areaId ? { areaId } : {};

    const assets = await Asset.find(filter).sort({ createdAt: -1 });

    const settings = await Settings.findOne();
    const defaultInflationRate = settings?.inflationRate || 0;

    const currentYear = new Date().getFullYear();

    const adjustedAssets = await Promise.all(
      assets.map(async (asset) => {
        const baseCost = asset.purchaseCost || 0;

        /* ---------- PARSE purchaseDate safely ---------- */
        let baseYear = currentYear;

        if (asset.purchaseDate) {
          let py;

          // If stored as just a year string: "2020"
          if (/^\d{4}$/.test(asset.purchaseDate)) {
            py = new Date(`${asset.purchaseDate}-01-01`);
          } else {
            py = new Date(asset.purchaseDate);
          }

          if (!isNaN(py)) {
            baseYear = py.getFullYear();
          }
        } else if (asset.createdAt) {
          baseYear = new Date(asset.createdAt).getFullYear();
        }

        if (baseYear > currentYear) baseYear = currentYear;

        /* ---------- History rebuild logic ---------- */
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
          console.log(`🔧 Rebuilding full history for ${asset.assetCode}`);

          const newHistory = [];
          let year = baseYear;
          let lastValue = baseCost;

          // First entry: base year with 0% inflation
          newHistory.push({
            year,
            inflationRate: 0,
            value: Number(lastValue.toFixed(2)),
          });

          // Future years: use current defaultInflationRate
          while (year < currentYear) {
            year++;
            lastValue = lastValue * (1 + defaultInflationRate / 100);

            newHistory.push({
              year,
              inflationRate: defaultInflationRate,
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
   🔹 CREATE asset
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
   🔹 UPDATE asset
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
   🔹 UPDATE value history inflation rate for a specific year
   - Full manual control of inflationRate
   - Recomputes that year and all future years
========================================================== */
router.put("/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    let { year, inflationRate } = req.body;

    year = Number(year);
    inflationRate = Number(inflationRate);

    if (!year || isNaN(year)) {
      return res.status(400).json({ error: "Valid 'year' is required" });
    }
    if (isNaN(inflationRate)) {
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

    // Update inflation rate for this year
    history[idx].inflationRate = inflationRate;

    // Recompute this year + all later years
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
   🔹 DELETE asset
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
