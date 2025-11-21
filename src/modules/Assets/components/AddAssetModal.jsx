import React, { useState, useEffect } from "react";

export default function AddAssetModal({
  show,
  onClose,
  onSave,
  existingAsset,
  areaId,
}) {
  const blankState = {
    assetCode: "",
    name: "",
    category: "",
    model: "",
    serial: "",
    status: "Active",
    installDate: "",
    installationCost: "",
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
    valueHistory: [],
    latestInflatedValue: "",
  };

  const [form, setForm] = useState(blankState);
  const [autoCode, setAutoCode] = useState("");
  const [saving, setSaving] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE;

  /* ==========================================================
      Supplier autocomplete
  =========================================================== */
  const [supplierList, setSupplierList] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/partners`);
        const data = await res.json();
        const suppliers = data.filter((p) => p.type === "Supplier");
        setSupplierList(suppliers);
      } catch (err) {
        console.error("Failed to load suppliers:", err);
      }
    };

    loadSuppliers();
  }, []);

  /* ==========================================================
      Convert DB date → DD/MM/YYYY
  =========================================================== */
  const toDisplayDate = (value) => {
    if (!value) return "";
    if (/^\d{4}$/.test(value)) return value;

    const dt = new Date(value);
    if (isNaN(dt)) return value;

    const d = String(dt.getDate()).padStart(2, "0");
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const y = dt.getFullYear();
    return `${d}/${m}/${y}`;
  };

  /* ==========================================================
      Convert DD/MM/YYYY → yyyy-mm-dd
  =========================================================== */
  const toDatabaseDate = (value) => {
    if (!value) return "";
    if (/^\d{4}$/.test(value)) return `${value}-01-01`;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [d, m, y] = value.split("/");
      return `${y}-${m}-${d}`;
    }

    return value;
  };

  /* ==========================================================
      Event bridge for History Modal
  =========================================================== */
  useEffect(() => {
    const handler = (e) => {
      if (window.openAssetHistory && e.detail) {
        window.openAssetHistory(e.detail);
      }
    };
    window.addEventListener("open-asset-history", handler);
    return () => window.removeEventListener("open-asset-history", handler);
  }, []);

  /* ==========================================================
      Load Asset Into Form
  =========================================================== */
  useEffect(() => {
    if (!show) return;

    if (existingAsset) {
      setForm({
        ...existingAsset,
        purchaseDate: toDisplayDate(existingAsset.purchaseDate),
      });

      setAutoCode(existingAsset.assetCode || "");
    } else {
      setForm({ ...blankState, _id: undefined });
      setAutoCode("");
    }
  }, [show, existingAsset]);

  /* ==========================================================
      Handle Form Changes
  =========================================================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "purchaseDate") {
      setForm((prev) => ({ ...prev, purchaseDate: value }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ==========================================================
      Recalculate History If Purchase Cost Changes
  =========================================================== */
  const recalcValueHistory = (newCost, history) => {
    let currentValue = Number(newCost);
    let updated = [];

    history
      .sort((a, b) => a.year - b.year)
      .forEach((entry) => {
        const rate = Number(entry.inflationRate);
        const newValue = currentValue + currentValue * (rate / 100);

        updated.push({
          year: entry.year,
          inflationRate: entry.inflationRate,
          value: Number(newValue.toFixed(2)),
        });

        currentValue = newValue;
      });

    return {
      valueHistory: updated,
      latestInflatedValue:
        updated.length > 0
          ? updated[updated.length - 1].value
          : Number(newCost),
    };
  };

  /* ==========================================================
      Save Asset
  =========================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter Asset Name.");
      return;
    }

    // Must pick a real supplier
    if (!supplierList.find((s) => s.partnerName === form.supplier)) {
      alert("Please select a supplier from the dropdown.");
      return;
    }

    setSaving(true);

    try {
      let payload = { ...form };
      let purchaseChanged =
        existingAsset &&
        Number(existingAsset.purchaseCost) !== Number(form.purchaseCost);

      if (purchaseChanged && existingAsset.valueHistory?.length > 0) {
        const recalculated = recalcValueHistory(
          form.purchaseCost,
          existingAsset.valueHistory
        );

        payload.valueHistory = recalculated.valueHistory;
        payload.latestInflatedValue = recalculated.latestInflatedValue;
      }

      payload.purchaseDate = toDatabaseDate(form.purchaseDate);
      payload.assetCode = autoCode;
      payload.areaId = areaId;

      const url = existingAsset
        ? `${API_BASE}/api/assets/${existingAsset._id}`
        : `${API_BASE}/api/assets`;

      const res = await fetch(url, {
        method: existingAsset ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save asset");

      const data = await res.json();
      if (onSave) onSave(data.asset || data);

      onClose();
    } catch (err) {
      console.error("❌ Error saving asset:", err);
      alert("Failed to save asset.");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  /* ==========================================================
      UI
  =========================================================== */
  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content p-3">
          <h5 className="mb-3">{existingAsset ? "Edit Asset" : "Add Asset"}</h5>

          <form onSubmit={handleSubmit}>
            {/* === Core Operations === */}
            <h6 className="fw-bold text-primary mt-2 mb-2">Core Operations</h6>
            <div className="row g-2 mb-3">
              {/* unchanged */}
              <div className="col-md-4">
                <label className="form-label small">Assigned Asset ID</label>
                <input type="text" className="form-control" value={autoCode} readOnly />
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

              <div className="col-md-4">
                <label className="form-label small">Installation Cost (£)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  name="installationCost"
                  value={form.installationCost}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* === Finance === */}
            <h6 className="fw-bold text-primary mt-3 mb-2">Finance & Lifecycle</h6>

            <div className="row g-2 mb-3">
              <div className="col-md-4">
                <label className="form-label small">Purchase Date</label>
                <input
                  type="text"
                  placeholder="dd/mm/yyyy or yyyy"
                  className="form-control"
                  name="purchaseDate"
                  value={form.purchaseDate}
                  onChange={handleChange}
                />
              </div>

              {/* ======================================================
                  SUPPLIER TYPE-AHEAD DROPDOWN
              ====================================================== */}
              <div className="col-md-4 position-relative">
                <label className="form-label small">Supplier</label>

                <input
                  type="text"
                  className="form-control"
                  name="supplier"
                  placeholder="Type to search..."
                  autoComplete="off"
                  value={form.supplier}
                  required
                  onChange={(e) => {
                    const text = e.target.value;
                    setForm({ ...form, supplier: text });

                    if (text.trim() === "") {
                      setFilteredSuppliers([]);
                      setShowSupplierDropdown(false);
                      return;
                    }

                    const filtered = supplierList.filter((s) =>
                      s.partnerName.toLowerCase().includes(text.toLowerCase())
                    );

                    setFilteredSuppliers(filtered);
                    setShowSupplierDropdown(true);
                  }}
                  onFocus={() => {
                    if (form.supplier.trim() === "") {
                      setFilteredSuppliers([]);
                    } else {
                      const filtered = supplierList.filter((s) =>
                        s.partnerName
                          .toLowerCase()
                          .includes(form.supplier.toLowerCase())
                      );
                      setFilteredSuppliers(filtered);
                    }
                    setShowSupplierDropdown(true);
                  }}
                />

                {showSupplierDropdown && filteredSuppliers.length > 0 && (
                  <div
                    className="list-group position-absolute w-100 shadow-sm"
                    style={{
                      zIndex: 9999,
                      maxHeight: "180px",
                      overflowY: "auto",
                    }}
                  >
                    {filteredSuppliers.map((s) => (
                      <button
                        type="button"
                        key={s._id}
                        className="list-group-item list-group-item-action"
                        onClick={() => {
                          setForm({ ...form, supplier: s.partnerName });
                          setShowSupplierDropdown(false);
                        }}
                      >
                        {s.partnerName}
                      </button>
                    ))}
                  </div>
                )}
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
                <label className="form-label small">Replacement Value (Latest) (£)</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    readOnly
                    value={
                      existingAsset?.latestInflatedValue
                        ? `£${Number(existingAsset.latestInflatedValue).toLocaleString()}`
                        : form.replacementValue
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-outline-info btn-sm"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("open-asset-history", { detail: existingAsset })
                      )
                    }
                  >
                    History
                  </button>
                </div>
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
                <label className="form-label small">Annual Maintenance Costs (£)</label>
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
                <label className="form-label small">Disposal Reason</label>
                <textarea
                  className="form-control"
                  rows="2"
                  name="disposalReason"
                  value={form.disposalReason}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`btn ${existingAsset ? "btn-warning" : "btn-primary"}`}
                disabled={saving}
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
