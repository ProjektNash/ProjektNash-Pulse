import React, { useState, useEffect } from "react";

export default function AddAssetModal({ show, onClose, onSave, existingAsset, areaId }) {
  const blankState = {
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
  const [saving, setSaving] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE;

  // 🔹 When modal opens — if editing, load existing; if new, get code from backend
  useEffect(() => {
    if (show) {
      if (existingAsset) {
        setForm(existingAsset);
        setAutoCode(existingAsset.assetCode || "");
      } else {
        setForm(blankState);
        fetchNextAssetCode();
      }
    }
  }, [show, existingAsset]);

  // 🔹 Ask backend for next sequential AST code
  const fetchNextAssetCode = async () => {
    try {
      setLoadingCode(true);
      const res = await fetch(`${API_BASE}/api/assets/next-code`);
      if (!res.ok) throw new Error("Failed to get next code");
      const data = await res.json();
      setAutoCode(data.nextCode);
      setForm((prev) => ({ ...prev, assetCode: data.nextCode }));
    } catch (err) {
      console.error("❌ Error fetching next asset code:", err);
      setAutoCode("AST-ERROR");
    } finally {
      setLoadingCode(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Save or update asset in MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Please enter Asset Name.");
      return;
    }

    setSaving(true);
    try {
      const { _id, ...cleanForm } = form;
      const payload = { ...cleanForm, assetCode: autoCode, areaId };

      const res = await fetch(
        existingAsset
          ? `${API_BASE}/api/assets/${existingAsset._id}`
          : `${API_BASE}/api/assets`,
        {
          method: existingAsset ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save asset");
      const data = await res.json();
      console.log("✅ Asset saved:", data);

      if (onSave) onSave(data.asset || data); // trigger parent refresh
      onClose();
    } catch (err) {
      console.error("❌ Error saving asset:", err);
      alert("Failed to save asset. Please check your connection.");
    } finally {
      setSaving(false);
    }
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
              <div className="col-md-4">
                <label className="form-label small">Assigned Asset ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={loadingCode ? "Loading..." : autoCode}
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
                <label className="form-label small">Installation / Commission Date</label>
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
                <label className="form-label small">Disposal / Write-Off Date</label>
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
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${existingAsset ? "btn-warning" : "btn-primary"}`}
                disabled={saving || loadingCode}
              >
                {saving ? "Saving..." : existingAsset ? "Update Asset" : "Save Asset"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
