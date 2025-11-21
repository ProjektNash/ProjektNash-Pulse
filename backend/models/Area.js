import mongoose from "mongoose";

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  locationCode: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Area", areaSchema);
