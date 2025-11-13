import express from "express";
import Asset from "../models/Asset.js";
import Settings from "../models/Setting.js";

const router = express.Router();

/* ==========================================================
   🔹 GET all assets (optionally filter by area)
========================================================== */
router.get("/", async (req, res) => {
  try {
    const { areaId } = req.query;
    const filter = areaId ? { areaId } : {};
    console.log("🔍 Fetching assets with filter:", filter);

    const assets = await Asset.find(filter).sort({ createdAt: -1 });
    console.log(`✅ Found ${assets.length} assets`);

    // ⭐ Fetch inflation % from Settings
    const settings = await Settings.findOne();
    const inflationRate = settings?.inflationRate || 0;

    const currentYear = new Date().getFullYear();

    // ⭐ Apply inflation to each asset
    const adjustedAssets = assets.map((asset) => {
      const baseValue = asset.purchaseCost || 0;  // ⭐ FIXED: correct field

      const purchaseYear = asset.purchaseDate
        ? new Date(asset.purchaseDate).getFullYear()
        : currentYear; // No purchase date → assume current year (0 years inflation)

      const yearsSince = currentYear - purchaseYear;

      const adjustedValue =
        baseValue > 0
          ? baseValue * Math.pow(1 + inflationRate / 100, yearsSince)
          : null;

      return {
        ...asset.toObject(),
        adjustedReplacementValue: adjustedValue
          ? adjustedValue.toFixed(2)
          : null,
      };
    });

    // ⭐ Return updated asset objects
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
