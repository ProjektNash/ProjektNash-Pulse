import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  inflationRate: { type: Number, default: 0 }, // % e.g. 3.2
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("Settings", SettingsSchema);
