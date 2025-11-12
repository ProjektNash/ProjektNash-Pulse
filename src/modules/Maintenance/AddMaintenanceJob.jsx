import React, { useState, useEffect } from "react";

export default function AddMaintenanceJob({ onClose, onSave, existingJob }) {
  const [form, setForm] = useState({
    assetCode: "",
    assetName: "",
    task: "",
    description: "",
    supplier: "",
    bookedDate: "",
    status: "Booked",
  });

  const [assets, setAssets] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE;

  // ✅ Fetch assets from backend
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/assets`);
        if (!res.ok) throw new Error("Failed to fetch assets");
        const data = await res.json();
        setAssets(data);
      } catch (err) {
        console.error("❌ Error loading assets:", err);
        setAssets([]);
      }
    };
    fetchAssets();
  }, [API_BASE]);

  // ✅ If editing, preload
  useEffect(() => {
    if (existingJob) {
      setForm(existingJob);
      setQuery(existingJob.assetName || existingJob.assetCode);
    }
  }, [existingJob]);

  // ✅ Filter assets by NAME (case-insensitive)
  useEffect(() => {
    if (query.trim() === "") {
      setFilteredAssets([]);
      return;
    }

    const results = assets.filter((a) => {
      const name =
        a.assetName ||
        a.name ||
        a.asset_name ||
        a.description ||
        a.asset_title ||
        "";
      return name.toLowerCase().includes(query.toLowerCase());
    });

    setFilteredAssets(results);
  }, [query, assets]);

  // ✅ Select asset
  const handleAssetSelect = (asset) => {
    setForm({
      ...form,
      assetCode: asset.assetCode || asset.code || "",
      assetName:
        asset.assetName ||
        asset.name ||
        asset.asset_name ||
        asset.description ||
        "Unnamed",
    });
    setQuery(
      asset.assetName ||
        asset.name ||
        asset.asset_name ||
        asset.description ||
        ""
    );
    setFilteredAssets([]);
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.assetCode || !form.assetName) {
      alert("Please select a valid asset from the list.");
      return;
    }

    const newJob = {
      ...form,
      _id: existingJob ? existingJob._id : Date.now().toString(),
      type: "Engineer",
    };
    onSave(newJob);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
      style={{ zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded p-4 shadow position-relative"
        style={{ width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h5 className="mb-3">
          {existingJob ? "Edit Maintenance Job" : "Add Maintenance Job"}
        </h5>

        <form onSubmit={handleSubmit}>
          {/* ✅ Searchable Asset Input */}
          <div className="mb-3 position-relative">
            <label className="form-label">Asset</label>
            <input
              type="text"
              className="form-control"
              placeholder="Start typing asset name..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {showDropdown && filteredAssets.length > 0 && (
              <ul
                className="list-group position-absolute w-100 shadow-sm"
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  zIndex: 9999,
                }}
              >
                {filteredAssets.map((asset) => {
                  const name =
                    asset.assetName ||
                    asset.name ||
                    asset.asset_name ||
                    asset.description ||
                    "Unnamed";
                  const code = asset.assetCode || asset.code || "";
                  return (
                    <li
                      key={asset._id}
                      className="list-group-item list-group-item-action"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAssetSelect(asset)}
                      style={{ cursor: "pointer" }}
                    >
                      <strong>{name}</strong>{" "}
                      {code && <span className="text-muted">({code})</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ✅ Job Type Dropdown */}
          <div className="mb-2">
            <label className="form-label">Job Type</label>
            <select
              name="task"
              className="form-select"
              value={form.task}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Type --</option>
              <option value="Service">Service</option>
              <option value="Repair">Repair</option>
              <option value="Inspection">Inspection</option>
              <option value="Upgrade">Upgrade</option>
              <option value="Breakdown">Breakdown</option>
              <option value="Installation">Installation</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* ✅ Description Textarea */}
          <div className="mb-3">
            <label className="form-label">Description / Details</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              placeholder="e.g. Replaced motor belt, repaired gearbox, recalibrated sensor..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Supplier / Engineer</label>
            <input
              type="text"
              name="supplier"
              className="form-control"
              value={form.supplier}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Booked Date</label>
            <input
              type="date"
              name="bookedDate"
              className="form-control"
              value={form.bookedDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={form.status}
              onChange={handleChange}
            >
              <option>Booked</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!form.assetCode}
            >
              {existingJob ? "Save Changes" : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
