import React, { useEffect, useState } from "react";

export default function Settings() {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const [inflationRate, setInflationRate] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load existing inflation rate
  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        setInflationRate(data.inflationRate || 0);
        setLastUpdated(data.lastUpdated);
      });
  }, []);

  const handleSave = async () => {
    await fetch(`${API_BASE}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inflationRate: parseFloat(inflationRate) }),
    });

    alert("Inflation rate updated");
  };

  return (
    <div className="container mt-4">
      <h3>Finance Settings</h3>
      <p className="text-muted">
        These settings control inflation-based replacement value calculations.
      </p>

      <div className="card p-3 mt-3">
        <label className="form-label">Annual Inflation Rate (%)</label>
        <input
          type="number"
          step="0.1"
          className="form-control"
          value={inflationRate}
          onChange={(e) => setInflationRate(e.target.value)}
        />

        {lastUpdated && (
          <small className="text-muted">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </small>
        )}

        <button onClick={handleSave} className="btn btn-primary mt-3">
          Save Inflation Rate
        </button>
      </div>
    </div>
  );
}
