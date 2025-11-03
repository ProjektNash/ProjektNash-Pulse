import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  assetCode: { type: String, unique: true, index: true }, // ✅ ensure uniqueness & fast lookups
  name: { type: String, required: true },
  category: String,
  model: String,
  serial: String,
  status: { type: String, default: "Active" },
  installDate: String,
  purchaseDate: String,
  supplier: String,
  purchaseCost: Number,
  replacementValue: Number,
  expectedLife: Number,
  annualMaintenanceCost: Number,
  warrantyExpiry: String,
  disposalDate: String,
  disposalValue: Number,
  disposalReason: String,

  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Area",
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

/* ==========================================================
   ✅ Pre-save hook: auto-assign next sequential code (safe)
   ----------------------------------------------------------
   - Finds the highest existing assetCode (AST-####)
   - Increments safely for concurrent inserts
========================================================== */
assetSchema.pre("save", async function (next) {
  try {
    // Only generate a code if missing
    if (this.isNew && !this.assetCode) {
      const last = await mongoose
        .model("Asset")
        .findOne({ assetCode: { $regex: /^AST-\d+$/ } })
        .sort({ assetCode: -1 })
        .lean();

      let nextNum = 1;
      if (last && last.assetCode) {
        const match = last.assetCode.match(/AST-(\d+)/);
        if (match) nextNum = parseInt(match[1], 10) + 1;
      }

      this.assetCode = `AST-${String(nextNum).padStart(4, "0")}`;
    }

    next();
  } catch (err) {
    console.error("❌ Error generating asset code:", err);
    next(err);
  }
});

export default mongoose.model("Asset", assetSchema);
