import React, { useEffect, useState } from "react";

export default function FinanceSettings() {
  const API_BASE = import.meta.env.VITE_API_BASE;

  const [inflationTable, setInflationTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [newYear, setNewYear] = useState("");
  const [newRate, setNewRate] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      const data = await res.json();

      setInflationTable(data.inflationTable || []);
    } catch (err) {
      console.error("❌ Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (index, field, val) => {
    const updated = [...inflationTable];
    updated[index][field] = val;
    setInflationTable(updated);
  };

  const handleAddYear = () => {
    if (!newYear || newRate === "") return alert("Enter both year and rate.");

    if (inflationTable.some((row) => row.year === Number(newYear))) {
      return alert("That year already exists.");
    }

    setInflationTable((prev) => [
      ...prev,
      { year: Number(newYear), rate: Number(newRate) },
    ]);

    setNewYear("");
    setNewRate("");
  };

  const handleDelete = (index) => {
    if (!window.confirm("Delete this entry?")) return;
    setInflationTable((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(`${API_BASE}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inflationTable: inflationTable.map((r) => ({
            year: Number(r.year),
            rate: Number(r.rate),
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setMessage("Saved — recalculating assets…");

      setTimeout(() => {
        loadSettings();
        setSaving(false);
      }, 800);
    } catch (err) {
      console.error("❌ Error saving settings:", err);
      alert("Failed to save settings.");
      setSaving(false);
    }
  };

  const handleNumberInput = (raw, setter) => {
    if (raw === "" || raw === "-") return setter(raw);
    if (!isNaN(Number(raw))) setter(raw);
  };

  if (loading) return <p className="p-3">Loading…</p>;

  return (
    <div className="container mt-3">
      <h4 className="fw-semibold mb-2">Finance Settings</h4>

      {saving && (
        <div className="alert alert-info py-2 small">
          Recalculating all asset values…
        </div>
      )}

      {message && !saving && (
        <div className="alert alert-success py-2 small">{message}</div>
      )}

      <div className="card p-2 shadow-sm">
        <h6 className="fw-bold mb-2">Yearly Inflation Rates</h6>

        <table className="table table-sm table-bordered mt-2 align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: "20%" }}>Year</th>
              <th style={{ width: "20%" }}>Rate (%)</th>
              <th style={{ width: "10%" }}></th>
            </tr>
          </thead>

          <tbody>
            {inflationTable
              .slice()
              .sort((a, b) => a.year - b.year)
              .map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={row.year}
                      onChange={(e) =>
                        handleTableChange(index, "year", Number(e.target.value))
                      }
                      disabled={saving}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={row.rate}
                      onChange={(e) =>
                        handleTableChange(index, "rate", e.target.value)
                      }
                      disabled={saving}
                    />
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(index)}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Add new year */}
        <div className="row g-2 mb-2">
          <div className="col-md-3">
            <input
              type="number"
              placeholder="Year"
              className="form-control form-control-sm"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="col-md-3">
            <input
              type="text"
              placeholder="Rate %"
              className="form-control form-control-sm"
              value={newRate}
              onChange={(e) => handleNumberInput(e.target.value, setNewRate)}
              disabled={saving}
            />
          </div>

          <div className="col-md-3">
            <button
              className="btn btn-success btn-sm w-100"
              onClick={handleAddYear}
              disabled={saving}
            >
              + Add
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
