import React, { useEffect, useState } from "react";

export default function Settings() {
  const API_BASE = import.meta.env.VITE_API_BASE;

  const [inflationTable, setInflationTable] = useState([]);
  const [defaultRate, setDefaultRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // New row fields
  const [newYear, setNewYear] = useState("");
  const [newRate, setNewRate] = useState("");

  /* ----------------------------------------------------------
     Load Settings + Inflation Table
  ---------------------------------------------------------- */
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      const data = await res.json();

      setInflationTable(data.inflationTable || []);
      setDefaultRate(data.defaultInflationRate || 0);
    } catch (err) {
      console.error("❌ Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------
     Update a row in the inflation table
  ---------------------------------------------------------- */
  const handleTableChange = (index, field, value) => {
    const updated = [...inflationTable];
    updated[index][field] = value;
    setInflationTable(updated);
  };

  /* ----------------------------------------------------------
     Add a new inflation year
  ---------------------------------------------------------- */
  const handleAddYear = () => {
    if (!newYear || !newRate) return alert("Enter both year and rate.");

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

  /* ----------------------------------------------------------
     Save settings to backend
  ---------------------------------------------------------- */
  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inflationTable,
          defaultInflationRate: Number(defaultRate),
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("❌ Error saving settings:", err);
      alert("Failed to save settings.");
    }
  };

  if (loading) {
    return <p className="p-4">Loading settings...</p>;
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Finance Settings</h3>
      <p className="text-muted">
        Configure default inflation rates used for asset value escalation.
      </p>

      {message && (
        <div className="alert alert-success py-2">{message}</div>
      )}

      {/* ===================== Default Rate ===================== */}
      <div className="card p-3 mb-4">
        <h5>Default Inflation Rate</h5>
        <p className="text-muted small">
          Used for years not defined in the table.
        </p>

        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small">Default Rate (%)</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              value={defaultRate}
              onChange={(e) => setDefaultRate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ===================== Inflation Table ===================== */}
      <div className="card p-3">
        <h5>Yearly Inflation Rates</h5>
        <p className="text-muted small">
          These override the default rate for specific years.
        </p>

        <table className="table table-bordered mt-2">
          <thead className="table-light">
            <tr>
              <th style={{ width: "25%" }}>Year</th>
              <th style={{ width: "25%" }}>Inflation Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {inflationTable
              .sort((a, b) => a.year - b.year)
              .map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={row.year}
                      onChange={(e) =>
                        handleTableChange(index, "year", Number(e.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={row.rate}
                      onChange={(e) =>
                        handleTableChange(index, "rate", Number(e.target.value))
                      }
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* ===================== Add New Year ===================== */}
        <div className="card p-3 bg-light mt-3">
          <h6>Add New Year</h6>

          <div className="row g-2">
            <div className="col-md-3">
              <input
                type="number"
                placeholder="Year"
                className="form-control"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                step="0.1"
                placeholder="Rate %"
                className="form-control"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-success w-100"
                onClick={handleAddYear}
              >
                + Add Year
              </button>
            </div>
          </div>
        </div>

        {/* Save Settings */}
        <button className="btn btn-primary mt-3" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
}
