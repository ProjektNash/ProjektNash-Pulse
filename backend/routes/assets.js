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
  const lastAsset = await Asset.findOne({ assetCode: { $regex: /^AST-\d+$/ } })
    .sort({ assetCode: -1 })
    .lean();

  let nextNum = 1;

  if (lastAsset && lastAsset.assetCode) {
    const match = lastAsset.assetCode.match(/AST-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `AST-${String(nextNum).padStart(4, "0")}`;
}

/* ==========================================================
   🔹 GET all assets (optionally filter by area)
========================================================== */
router.get("/", async (req, res) => {
  try {
    const { areaId } = req.query;
    const filter = areaId ? { areaId } : {};
    const assets = await Asset.find(filter);
    res.json(assets);
  } catch (err) {
    console.error("❌ Error fetching assets:", err);
    res.status(500).json({ error: "Failed to load assets" });
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
    res.status(500).json({ error: "Failed to generate next asset code" });
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

    const newAsset = new Asset(req.body);
    await newAsset.save();

    res.json({ message: "Asset created", asset: newAsset });
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
    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Asset updated", asset: updated });
  } catch (err) {
    console.error("❌ Error updating asset:", err);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

/* ==========================================================
   🔹 DELETE asset
========================================================== */
router.delete("/:id", async (req, res) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ message: "Asset deleted" });
  } catch (err) {
    console.error("❌ Error deleting asset:", err);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

export default router;
