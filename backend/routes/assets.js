import express from "express";
import Asset from "../models/Asset.js";

const router = express.Router();

// Get all assets
router.get("/", async (req, res) => {
  const assets = await Asset.find();
  res.json(assets);
});

// Create new asset
router.post("/", async (req, res) => {
  const newAsset = new Asset(req.body);
  await newAsset.save();
  res.json({ message: "Asset created", asset: newAsset });
});

// Update asset
router.put("/:id", async (req, res) => {
  const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete asset
router.delete("/:id", async (req, res) => {
  await Asset.findByIdAndDelete(req.params.id);
  res.json({ message: "Asset deleted" });
});

export default router;
