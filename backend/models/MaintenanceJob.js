import mongoose from "mongoose";

const MaintenanceJobSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  assetName: { type: String, required: true },
  jobType: { type: String, required: true },        // e.g. Inspection, Repair, Service
  description: { type: String },
  engineer: { type: String },
  bookedDate: { type: Date },
  status: { type: String, default: "Booked" },      // e.g. Booked, Completed, Cancelled
});

export default mongoose.model("MaintenanceJob", MaintenanceJobSchema);
