import mongoose from "mongoose";

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  locationCode: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Area", areaSchema);
