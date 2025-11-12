import mongoose from "mongoose";

const MaintenanceJobSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" }, // not required
  assetName: { type: String, required: true },
  jobType: { type: String, required: true },
  description: { type: String },
  engineer: { type: String },
  bookedDate: { type: Date, required: true },
  status: { type: String, default: "Booked" },
});

export default mongoose.model("MaintenanceJob", MaintenanceJobSchema);
