import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  email: { type: String },
});

const partnerSchema = new mongoose.Schema(
  {
    partnerName: { type: String, required: true },
    type: { type: String, default: "Other" }, // Supplier, Engineer, OEM, etc.
    contacts: [contactSchema], // multiple contacts per company
    notes: { type: String },
    sapVendorCode: { type: String }, // optional, for future SAP sync
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);
