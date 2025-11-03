import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function AddAssetModal({ show, onClose, onSave, existingAsset }) {
  const blankState = {
    id: "",
    assetCode: "",
    name: "",
    category: "",
    model: "",
    serial: "",
    status: "Active",
    installDate: "",
    purchaseDate: "",
    supplier: "",
    purchaseCost: "",
    replacementValue: "",
    expectedLife: "",
    annualMaintenanceCost: "",
    warrantyExpiry: "",
    disposalDate: "",
    disposalValue: "",
    disposalReason: "",
  };

  const [form, setForm] = useState(blankState);
  const [autoCode, setAutoCode] = useState("");

  // ✅ Generate a new unique asset code each time the modal opens (if adding new)
  useEffect(() => {
    if (show && !existingAsset) {
      let nextId = parseInt(localStorage.getItem("pn_nextAssetId") || "1", 10);
      const newCode = `AST-${nextId.toString().padStart(4, "0")}`;
      setAutoCode(newCode);
      setForm(blankState); // reset the form fields when opening new
    }
  }, [show, existingAsset]);

  // ✅ Populate form when editing an existing asset
  useEffect(() => {
    if (existingAsset) {
      setForm(existingAsset);
      setAutoCode(existingAsset.assetCode || "");
    }
  }, [existingAsset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter Asset Name.");
      return;
    }

    let nextId = parseInt(localStorage.getItem("pn_nextAssetId") || "1", 10);
    const assetCode = existingAsset?.assetCode || `AST-${nextId.toString().padStart(4, "0")}`;

    // 🔹 Prepare asset object
    const assetToSave = existingAsset
      ? { ...existingAsset, ...form, assetCode }
      : { ...form, id: uuidv4(), assetCode };

    // 🔹 Save and increment counter if new asset
    if (!existingAsset) {
      nextId++;
      localStorage.setItem("pn_nextAssetId", nextId);
    }

    onSave(assetToSave);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content p-3">
          <h5 className="mb-3">{existingAsset ? "Edit Asset" : "Add Asset"}</h5>

          <form onSubmit={handleSubmit}>
            {/* ===== Core Operations ===== */}
            <h6 className="fw-bold text-primary mt-2 mb-2">Core Operations</h6>
            <div className="row g-2 mb-3">
              {/* Read-only assigned ID */}
              <div className="col-md-4">
                <label className="form-label small">Assigned Asset ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={autoCode}
                  readOnly
                />
              </div>

              <div className="col-md-8">
                <label className="form-label small">Asset Name / Description</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small">Category / Type</label>
                <input
                  type="text"
                  className="form-control"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Model</label>
                <input
                  type="text"
                  className="form-control"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Serial Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="serial"
                  value={form.serial}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option>Active</option>
                  <option>Out of Service</option>
                  <option>Scrapped</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">
                  Installation / Commission Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="installDate"
                  value={form.installDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ===== Finance & Lifecycle ===== */}
            <h6 className="fw-bold text-primary mt-3 mb-2">Finance & Lifecycle</h6>
            <div className="row g-2 mb-3">
              <div className="col-md-4">
                <label className="form-label small">Purchase Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="purchaseDate"
                  value={form.purchaseDate}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Supplier</label>
                <input
                  type="text"
                  className="form-control"
                  name="supplier"
                  value={form.supplier}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Purchase Cost (£)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="purchaseCost"
                  value={form.purchaseCost}
                  onChange={handleChange}
                />
              </div>

              {/* Newly added fields */}
              <div className="col-md-4">
                <label className="form-label small">Replacement Value (£)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="replacementValue"
                  value={form.replacementValue}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Expected Useful Life (years)</label>
                <input
                  type="number"
                  className="form-control"
                  name="expectedLife"
                  value={form.expectedLife}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">
                  Annual Maintenance Costs (approx.) (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="annualMaintenanceCost"
                  value={form.annualMaintenanceCost}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small">Warranty Expiry</label>
                <input
                  type="date"
                  className="form-control"
                  name="warrantyExpiry"
                  value={form.warrantyExpiry}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">
                  Disposal / Write-Off Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="disposalDate"
                  value={form.disposalDate}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Disposal Value (£)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="disposalValue"
                  value={form.disposalValue}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12">
                <label className="form-label small">Disposal / Write-Off Reason</label>
                <textarea
                  className="form-control"
                  rows="2"
                  name="disposalReason"
                  value={form.disposalReason}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* ===== Footer ===== */}
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${existingAsset ? "btn-warning" : "btn-primary"}`}
              >
                {existingAsset ? "Update Asset" : "Save Asset"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
