import express from "express";
import MaintenanceJob from "../models/MaintenanceJob.js";

const router = express.Router();

// Get all jobs (optional: sort by bookedDate ascending)
router.get("/", async (req, res) => {
  try {
    const jobs = await MaintenanceJob.find().sort({ bookedDate: 1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create job
router.post("/", async (req, res) => {
  try {
    const job = new MaintenanceJob(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update job (e.g., mark as completed)
router.put("/:id", async (req, res) => {
  try {
    const updated = await MaintenanceJob.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete job
router.delete("/:id", async (req, res) => {
  try {
    await MaintenanceJob.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
