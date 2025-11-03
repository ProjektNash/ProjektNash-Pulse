import express from "express";
import Asset from "../models/Asset.js";

const router = express.Router();

// 🔹 Get assets (all or filtered by area)
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

// 🔹 Create new asset
router.post("/", async (req, res) => {
  try {
    const newAsset = new Asset(req.body);
    await newAsset.save();
    res.json({ message: "Asset created", asset: newAsset });
  } catch (err) {
    console.error("❌ Error creating asset:", err);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

// 🔹 Update asset
router.put("/:id", async (req, res) => {
  try {
    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Asset updated", asset: updated });
  } catch (err) {
    console.error("❌ Error updating asset:", err);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

// 🔹 Delete asset
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
