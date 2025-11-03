import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  assetCode: String,
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

// ✅ Auto-generate next sequential asset code
assetSchema.pre("save", async function (next) {
  if (this.isNew && !this.assetCode) {
    const count = await mongoose.model("Asset").countDocuments();
    const nextNumber = count + 1;
    this.assetCode = `AST-${nextNumber.toString().padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Asset", assetSchema);
