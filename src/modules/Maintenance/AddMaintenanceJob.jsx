import React, { useState, useEffect } from "react";

export default function AddMaintenanceJob({ onClose, onSave, existingJob }) {
  const [form, setForm] = useState({
    assetCode: "",
    assetName: "",
    jobType: "",
    description: "",
    engineer: "",
    engineerId: "",
    bookedDate: "",
    status: "Booked",
  });

  const [assets, setAssets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [assetQuery, setAssetQuery] = useState("");
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [engineerQuery, setEngineerQuery] = useState("");
  const [filteredEngineers, setFilteredEngineers] = useState([]);
  const [showEngineerDropdown, setShowEngineerDropdown] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE;

  /* ============================================================
     🔹 Fetch Assets + Engineers
  ============================================================ */
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

    const fetchEngineers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/partners`);
        if (!res.ok) throw new Error("Failed to fetch partners");
        const data = await res.json();
        const engineersOnly = data.filter((p) => p.type === "Engineer");
        setEngineers(engineersOnly);
      } catch (err) {
        console.error("❌ Error loading engineers:", err);
        setEngineers([]);
      }
    };

    fetchAssets();
    fetchEngineers();
  }, [API_BASE]);

  /* ============================================================
     🔹 Preload existing job (Edit)
  ============================================================ */
  useEffect(() => {
    if (existingJob) {
      setForm(existingJob);
      setAssetQuery(existingJob.assetName || existingJob.assetCode || "");
      setEngineerQuery(existingJob.engineer || "");
    }
  }, [existingJob]);

  /* ============================================================
     🔹 Filtering
  ============================================================ */
  useEffect(() => {
    if (!assetQuery.trim()) return setFilteredAssets([]);
    const results = assets.filter((a) => {
      const name =
        a.assetName ||
        a.name ||
        a.asset_name ||
        a.description ||
        a.asset_title ||
        "";
      return name.toLowerCase().includes(assetQuery.toLowerCase());
    });
    setFilteredAssets(results);
  }, [assetQuery, assets]);

  useEffect(() => {
    if (!engineerQuery.trim()) return setFilteredEngineers([]);
    const results = engineers.filter((e) =>
      e.partnerName.toLowerCase().includes(engineerQuery.toLowerCase())
    );
    setFilteredEngineers(results);
  }, [engineerQuery, engineers]);

  /* ============================================================
     🔹 Selections
  ============================================================ */
  const handleAssetSelect = (asset) => {
    const name =
      asset.assetName ||
      asset.name ||
      asset.asset_name ||
      asset.description ||
      asset.asset_title ||
      "Unnamed";

    setForm((prev) => ({
      ...prev,
      assetCode: asset.assetCode || asset.code || "",
      assetName: name,
    }));
    setAssetQuery(name);
    setShowAssetDropdown(false);
  };

  const handleEngineerSelect = (eng) => {
    setForm((prev) => ({
      ...prev,
      engineer: eng.partnerName,
      engineerId: eng._id,
    }));
    setEngineerQuery(eng.partnerName);
    setShowEngineerDropdown(false);
  };

  /* ============================================================
     🔹 Validation / Submission
  ============================================================ */
  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validate required fields
    if (!form.assetCode || !form.assetName) {
      alert("Please select a valid asset.");
      return;
    }
    if (!form.jobType) {
      alert("Please select a job type.");
      return;
    }
    if (!form.bookedDate) {
      alert("Please choose a booked date.");
      return;
    }
    if (!form.engineer) {
      alert("Please select an engineer.");
      return;
    }

    // ✅ Construct clean payload (only the fields backend expects)
    const payload = {
      assetCode: form.assetCode,
      assetName: form.assetName,
      jobType: form.jobType,
      description: form.description || "",
      engineer: form.engineer,
      bookedDate: form.bookedDate,
      status: form.status,
      _id: existingJob?._id, // only used for PUT
    };

    onSave(payload);
  };

  /* ============================================================
     🔹 Render
  ============================================================ */
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
              value={assetQuery}
              onChange={(e) => {
                setAssetQuery(e.target.value);
                setShowAssetDropdown(true);
              }}
              onFocus={() => setShowAssetDropdown(true)}
              onBlur={() => setTimeout(() => setShowAssetDropdown(false), 200)}
            />
            {showAssetDropdown && filteredAssets.length > 0 && (
              <ul
                className="list-group position-absolute w-100 shadow-sm"
                style={{ maxHeight: "200px", overflowY: "auto", zIndex: 9999 }}
              >
                {filteredAssets.map((asset) => {
                  const name =
                    asset.assetName ||
                    asset.name ||
                    asset.asset_name ||
                    asset.description ||
                    asset.asset_title ||
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

          {/* ✅ Job Type */}
          <div className="mb-2">
            <label className="form-label">Job Type</label>
            <select
              name="jobType"
              className="form-select"
              value={form.jobType}
              onChange={(e) => setForm({ ...form, jobType: e.target.value })}
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

          {/* ✅ Description */}
          <div className="mb-3">
            <label className="form-label">Description / Details</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              placeholder="e.g. Replaced motor belt, repaired gearbox..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* ✅ Engineer Selector */}
          <div className="mb-3 position-relative">
            <label className="form-label">Engineer</label>
            <input
              type="text"
              className="form-control"
              placeholder="Start typing engineer name..."
              value={engineerQuery}
              onChange={(e) => {
                setEngineerQuery(e.target.value);
                setShowEngineerDropdown(true);
              }}
              onFocus={() => setShowEngineerDropdown(true)}
              onBlur={() =>
                setTimeout(() => setShowEngineerDropdown(false), 200)
              }
              required
            />
            {showEngineerDropdown && filteredEngineers.length > 0 && (
              <ul
                className="list-group position-absolute w-100 shadow-sm"
                style={{ maxHeight: "200px", overflowY: "auto", zIndex: 9999 }}
              >
                {filteredEngineers.map((eng) => (
                  <li
                    key={eng._id}
                    className="list-group-item list-group-item-action"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleEngineerSelect(eng)}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>{eng.partnerName}</strong>
                    {eng.contacts?.[0] && (
                      <div className="small text-muted">
                        {eng.contacts[0].email || eng.contacts[0].phone}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ✅ Booked Date */}
          <div className="mb-3">
            <label className="form-label">Booked Date</label>
            <input
              type="date"
              name="bookedDate"
              className="form-control"
              value={form.bookedDate}
              onChange={(e) =>
                setForm({ ...form, bookedDate: e.target.value })
              }
              required
            />
          </div>

          {/* ✅ Status */}
          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Booked</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          {/* ✅ Buttons */}
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
