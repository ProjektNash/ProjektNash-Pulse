import express from "express";
import Area from "../models/Area.js";

const router = express.Router();

// 🔹 Get all areas
router.get("/", async (req, res) => {
  try {
    const areas = await Area.find().sort({ createdAt: -1 });
    res.json(areas);
  } catch (err) {
    console.error("❌ Error fetching areas:", err);
    res.status(500).json({ error: "Failed to fetch areas" });
  }
});

// 🔹 Create a new area
router.post("/", async (req, res) => {
  try {
    const newArea = new Area(req.body);
    await newArea.save();
    res.json({ message: "Area created", area: newArea });
  } catch (err) {
    console.error("❌ Error creating area:", err);
    res.status(500).json({ error: "Failed to create area" });
  }
});

// 🔹 Delete an area
router.delete("/:id", async (req, res) => {
  try {
    await Area.findByIdAndDelete(req.params.id);
    res.json({ message: "Area deleted" });
  } catch (err) {
    console.error("❌ Error deleting area:", err);
    res.status(500).json({ error: "Failed to delete area" });
  }
});

export default router;
