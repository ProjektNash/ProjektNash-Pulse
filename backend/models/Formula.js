import mongoose from "mongoose";

/* ------------------------------
   RAW MATERIAL ROW SCHEMA
------------------------------ */
const RowSchema = new mongoose.Schema({
  itemCode: { type: String, default: "" },
  percentages: { type: Object, default: {} }
});

/* ------------------------------
   VARIATION SCHEMA (A, B, C...)
------------------------------ */
const VariationSchema = new mongoose.Schema({
  notes: { type: String, default: "" },
  rows: { type: [RowSchema], default: [] },

  // ⭐ NEW — Store photos for this variation
  photos: [
    {
      data: { type: String },          // base64 string
      fileName: { type: String },
      contentType: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }
  ]
});

/* ------------------------------
   MAIN FORMULA SCHEMA
------------------------------ */
const FormulaSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true },
    description: { type: String, required: true },
    notes: { type: String, default: "" },

    variations: { type: [String], default: ["A"] },

    variationData: {
      type: Map,
      of: VariationSchema,
      default: {},
    },

    createdBy: { type: String, default: "Unknown" },
    createdByName: { type: String, default: "Unknown" },

    status: { type: String, default: "Open" }, // Open / In Progress / Finished

    // ⭐ NEW FIELDS
    targetDate: { type: Date },
    finishedDate: { type: Date }
  },
  { timestamps: true } // createdAt + updatedAt
);

export default mongoose.model("Formula", FormulaSchema);
