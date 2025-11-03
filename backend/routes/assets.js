import express from "express";
import Asset from "../models/Asset.js";

const router = express.Router();

/* ==========================================================
   🔹 Helper: Generate next sequential asset code
   ----------------------------------------------------------
   - Looks up the highest existing code in DB
   - Extracts numeric part (e.g. AST-0023 → 23)
   - Returns next one as AST-0024
========================================================== */
async function getNextAssetCode() {
  try {
    const lastAsset = await Asset.findOne({ assetCode: { $regex: /^AST-\d+$/ } })
      .sort({ assetCode: -1 })
      .lean();

    let nextNum = 1;

    if (lastAsset && lastAsset.assetCode) {
      const match = lastAsset.assetCode.match(/AST-(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }

    return `AST-${String(nextNum).padStart(4, "0")}`;
  } catch (err) {
    console.error("❌ getNextAssetCode() failed:", err.message);
    throw new Error("Failed to generate next asset code");
  }
}

/* ==========================================================
   🔹 GET all assets (optionally filter by area)
========================================================== */
router.get("/", async (req, res) => {
  try {
    const { areaId } = req.query;
    const filter = areaId ? { areaId } : {};
    console.log("🔍 Fetching assets with filter:", filter);

    const assets = await Asset.find(filter);
    console.log(`✅ Found ${assets.length} assets`);

    res.json(assets);
  } catch (err) {
    console.error("❌ Error fetching assets:", err);
    res.status(500).json({ error: err.message || "Failed to load assets" });
  }
});

/* ==========================================================
   🔹 GET next available asset code (frontend fetches this)
========================================================== */
router.get("/next-code", async (req, res) => {
  try {
    const nextCode = await getNextAssetCode();
    res.json({ nextCode });
  } catch (err) {
    console.error("❌ Error generating next asset code:", err);
    res.status(500).json({ error: err.message || "Failed to generate next asset code" });
  }
});

/* ==========================================================
   🔹 CREATE new asset
   ----------------------------------------------------------
   - Automatically assigns next assetCode if missing
========================================================== */
router.post("/", async (req, res) => {
  try {
    let { assetCode } = req.body;

    if (!assetCode) {
      assetCode = await getNextAssetCode();
      req.body.assetCode = assetCode;
    }

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
    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });

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
