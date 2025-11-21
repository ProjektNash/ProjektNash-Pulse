import mongoose from "mongoose";

/* ==========================================================
   🔹 Asset Schema Definition
========================================================== */
const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      unique: true,
      index: true,
      sparse: true, // ✅ prevents unique index conflicts on null
    },
    name: { type: String, required: true },
    category: String,
    model: String,
    serial: String,
    status: { type: String, default: "Active" },
    installDate: String,
    installationCost: Number,
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

    /* ⭐ NEW: Annual value tracking history */
    valueHistory: {
      type: [
        {
          year: Number,
          inflationRate: Number,
          value: Number,
        },
      ],
      default: [],
    },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

/* ==========================================================
   ✅ Pre-save hook: Auto-assign next sequential code
========================================================== */
assetSchema.pre("save", async function (next) {
  try {
    if (this.isNew && !this.assetCode) {
      let assigned = false;
      let retries = 0;

      while (!assigned && retries < 3) {
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

        const newCode = `AST-${String(nextNum).padStart(4, "0")}`;

        const exists = await mongoose
          .model("Asset")
          .exists({ assetCode: newCode });

        if (!exists) {
          this.assetCode = newCode;
          assigned = true;
        } else {
          retries++;
          console.warn(`⚠️ Asset code ${newCode} already exists, retry ${retries}`);
        }
      }

      if (!assigned) {
        throw new Error("Unable to generate unique asset code after multiple retries.");
      }
    }

    next();
  } catch (err) {
    console.error("❌ Error generating asset code:", err);
    next(err);
  }
});

export default mongoose.model("Asset", assetSchema);
