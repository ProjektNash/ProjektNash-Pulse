import express from "express";
import Area from "../models/Area.js";

const router = express.Router();

// Get all areas
router.get("/", async (req, res) => {
  const areas = await Area.find();
  res.json(areas);
});

// Create a new area
router.post("/", async (req, res) => {
  const newArea = new Area(req.body);
  await newArea.save();
  res.json({ message: "Area created", area: newArea });
});

// Delete an area
router.delete("/:id", async (req, res) => {
  await Area.findByIdAndDelete(req.params.id);
  res.json({ message: "Area deleted" });
});

export default router;
