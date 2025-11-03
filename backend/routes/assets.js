import express from "express";
import Asset from "../models/Asset.js";

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
    res.json(assets);
  } catch (err) {
    console.error("❌ Error fetching assets:", err);
    res.status(500).json({ error: err.message || "Failed to load assets" });
  }
});

/* ==========================================================
   🔹 CREATE new asset
   ----------------------------------------------------------
   - Backend now auto-generates assetCode (AST-####)
   - Ensures no duplicate _id or assetCode from frontend
========================================================== */
router.post("/", async (req, res) => {
  try {
    // 🔒 Clean incoming data
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

    // Prevent changing assetCode manually
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
