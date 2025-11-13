import express from "express";
import Asset from "../models/Asset.js";
import Settings from "../models/Setting.js";

const router = express.Router();

/* ==========================================================
   🔹 GET all assets (optionally filter by area)
   🔹 TRUE YEAR-BY-YEAR INFLATION HISTORY
========================================================== */
router.get("/", async (req, res) => {
  try {
    const { areaId } = req.query;
    const filter = areaId ? { areaId } : {};
    console.log("🔍 Fetching assets with filter:", filter);

    const assets = await Asset.find(filter).sort({ createdAt: -1 });
    console.log(`✅ Found ${assets.length} assets`);

    // Get inflation setting
    const settings = await Settings.findOne();
    const inflationRate = settings?.inflationRate || 0;
    const currentYear = new Date().getFullYear();

    // Process each asset and manage stored inflation history
    const adjustedAssets = await Promise.all(
      assets.map(async (asset) => {
        const baseCost = asset.purchaseCost || 0;

        // If no valueHistory exists → create first entry
        if (!asset.valueHistory || asset.valueHistory.length === 0) {
          asset.valueHistory = [
            {
              year: currentYear,
              inflationRate: 0,
              value: baseCost,
            },
          ];
          await asset.save();
        }

        // Get the most recent stored year
        let lastEntry = asset.valueHistory[asset.valueHistory.length - 1];

        // If asset history is behind → fill each missing year
        while (lastEntry.year < currentYear) {
          const nextYear = lastEntry.year + 1;

          const newValue =
            lastEntry.value *
            (1 + (inflationRate || 0) / 100);

          const newEntry = {
            year: nextYear,
            inflationRate,
            value: Number(newValue.toFixed(2)),
          };

          asset.valueHistory.push(newEntry);
          lastEntry = newEntry;
        }

        // Save history updates if added years
        await asset.save();

        return {
          ...asset.toObject(),
          latestInflatedValue: lastEntry.value,
          latestInflationRate: lastEntry.inflationRate,
        };
      })
    );

    res.json(adjustedAssets);
  } catch (err) {
    console.error("❌ Error fetching assets:", err);
    res.status(500).json({ error: err.message || "Failed to load assets" });
  }
});

/* ==========================================================
   🔹 CREATE new asset
========================================================== */
router.post("/", async (req, res) => {
  try {
    if (req.body._id) delete req.body._id;
    if (req.body.assetCode) delete req.body.assetCode;

    console.log("🆕 Creating new asset:", req.body);

    const newAsset = new Asset(req.body);
    await newAsset.save();

    console.log("✅ Asset created:", newAsset.assetCode);
    res.json({ message: "Asset created successfully", asset: newAsset });
  } catch (err) {
    console.error("❌ Error creating asset:", err);
    res.status(500).json({ error: err.message || "Failed to create asset" });
  }
});

/* ==========================================================
   🔹 UPDATE asset
========================================================== */
router.put("/:id", async (req, res) => {
  try {
    console.log("✏️ Updating asset:", req.params.id);

    if (req.body.assetCode) delete req.body.assetCode;
    if (req.body._id) delete req.body._id;

    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Asset not found" });
    }

    console.log("✅ Asset updated:", updated.assetCode);
    res.json({ message: "Asset updated successfully", asset: updated });
  } catch (err) {
    console.error("❌ Error updating asset:", err);
    res.status(500).json({ error: err.message || "Failed to update asset" });
  }
});

/* ==========================================================
   🔹 DELETE asset
========================================================== */
router.delete("/:id", async (req, res) => {
  try {
    console.log("🗑️ Deleting asset:", req.params.id);
    const deleted = await Asset.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Asset not found" });
    }

    console.log("✅ Asset deleted:", deleted.assetCode);
    res.json({ message: "Asset deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting asset:", err);
    res.status(500).json({ error: err.message || "Failed to delete asset" });
  }
});

export default router;
