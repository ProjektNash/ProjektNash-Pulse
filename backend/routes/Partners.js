import express from "express";
import Partner from "../models/Partner.js";

const router = express.Router();

// ✅ GET all partners
router.get("/", async (req, res) => {
  try {
    const partners = await Partner.find().sort({ partnerName: 1 });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST new partner
router.post("/", async (req, res) => {
  try {
    const partner = new Partner(req.body);
    const saved = await partner.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ PUT update partner
router.put("/:id", async (req, res) => {
  try {
    const updated = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Partner not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ DELETE partner
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Partner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Partner not found" });
    res.json({ message: "Partner deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
