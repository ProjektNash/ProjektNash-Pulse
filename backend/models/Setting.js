import mongoose from "mongoose";

// Schema for each year's inflation rate
const inflationYearSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    rate: { type: Number, required: true }, // % inflation for that year
  },
  { _id: false }
);

// Settings schema
const settingSchema = new mongoose.Schema(
  {
    // Legacy field (kept for backwards compatibility — backend still checks it)
    inflationRate: { type: Number, default: 0 },

    // Used when a year has no entry in the inflationTable
    defaultInflationRate: { type: Number, default: 0 },

    // Main per-year inflation table
    inflationTable: [inflationYearSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
