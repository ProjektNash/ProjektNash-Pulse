import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AssetHistoryModal({ asset, onClose }) {
  const API_BASE = import.meta.env.VITE_API_BASE;

  const [history, setHistory] = useState(asset.valueHistory || []);
  const [savingYear, setSavingYear] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setHistory(asset.valueHistory || []);
  }, [asset]);

  const handleRateChange = (index, newRate) => {
    const updated = [...history];
    updated[index] = {
      ...updated[index],
      inflationRate: newRate,
    };
    setHistory(updated);
  };

  const handleSaveRow = async (index) => {
    setError("");
    setMessage("");
    const row = history[index];
    if (!row) return;

    try {
      setSavingYear(row.year);

      const res = await fetch(
        `${API_BASE}/api/assets/${asset._id}/history`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: row.year,
            inflationRate: Number(row.inflationRate),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update history");
      }

      const data = await res.json();

      // Replace local history with latest from backend
      setHistory(data.asset.valueHistory || []);
      setMessage(`Updated year ${row.year} successfully.`);

      // Optional: if you want the main list to refresh automatically:
      // window.location.reload();
    } catch (err) {
      console.error("❌ Error updating history row:", err);
      setError(err.message || "Failed to update history");
    } finally {
      setSavingYear(null);
    }
  };

  if (!asset) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">
              Value History — {asset.assetCode} ({asset.name})
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {error && (
              <div className="alert alert-danger py-2">{error}</div>
            )}
            {message && (
              <div className="alert alert-success py-2">{message}</div>
            )}

            {(!history || history.length === 0) ? (
              <p className="text-secondary">No history available.</p>
            ) : (
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "15%" }}>Year</th>
                    <th style={{ width: "25%" }}>Inflation Rate (%)</th>
                    <th style={{ width: "30%" }}>Value (£)</th>
                    <th style={{ width: "30%" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history
                    .slice()
                    .sort((a, b) => a.year - b.year)
                    .map((h, index) => (
                      <tr key={index}>
                        <td>{h.year}</td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            className="form-control form-control-sm"
                            value={
                              h.inflationRate === null ||
                              h.inflationRate === undefined
                                ? ""
                                : h.inflationRate
                            }
                            onChange={(e) =>
                              handleRateChange(index, e.target.value)
                            }
                          />
                        </td>
                        <td>£{Number(h.value).toLocaleString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            disabled={savingYear === h.year}
                            onClick={() => handleSaveRow(index)}
                          >
                            {savingYear === h.year
                              ? "Saving..."
                              : "Save"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
