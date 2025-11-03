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
  area: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Asset", assetSchema);
