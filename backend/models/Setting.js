import mongoose from "mongoose";

const inflationYearSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    rate: { type: Number, required: true }, // % for that year
  },
  { _id: false }
);

const settingSchema = new mongoose.Schema(
  {
    // legacy single rate (kept for backwards compatibility / fallback)
    inflationRate: { type: Number, default: 0 },

    // default rate when a year is missing from the table
    defaultInflationRate: { type: Number, default: 0 },

    // main per-year inflation table
    inflationTable: [inflationYearSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
