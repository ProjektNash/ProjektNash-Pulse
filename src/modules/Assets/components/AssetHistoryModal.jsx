import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export default function AssetHistoryModal({ asset, onClose }) {
  const API_BASE = import.meta.env.VITE_API_BASE;

  const [history, setHistory] = useState(asset.valueHistory || []);
  const [savingYear, setSavingYear] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  /* --------------------------------------------
     Load history when asset changes
  -------------------------------------------- */
  useEffect(() => {
    setHistory(asset.valueHistory || []);
  }, [asset]);

  /* --------------------------------------------
     Draw / Update Chart.js graph
  -------------------------------------------- */
  useEffect(() => {
    if (!history || history.length === 0) return;

    const years = history.map((h) => h.year);
    const values = history.map((h) => h.value);

    const ctx = chartRef.current.getContext("2d");

    // Destroy old chart before drawing a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Inflated Value (£)",
            data: values,
            borderWidth: 2,
            tension: 0.25,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                "£" + Number(ctx.raw).toLocaleString(),
            },
          },
        },
        scales: {
          y: {
            title: { display: true, text: "Value (£)" },
            ticks: {
              callback: (v) => "£" + v.toLocaleString(),
            },
          },
          x: {
            title: { display: true, text: "Year" },
          },
        },
      },
    });
  }, [history]);

  /* --------------------------------------------
     Handle Inflation Rate Editing
  -------------------------------------------- */
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

      // Refresh local history
      setHistory(data.asset.valueHistory || []);
      setMessage(`Updated year ${row.year} successfully.`);
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message);
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
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
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

            {/* --------------------------- */}
            {/* TABLE OF YEARS / RATES / VALUES */}
            {/* --------------------------- */}
            {history.length === 0 ? (
              <p className="text-secondary">No history available.</p>
            ) : (
              <table className="table table-bordered table-striped align-middle mb-4">
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

            {/* --------------------------- */}
            {/* VALUE TREND GRAPH */}
            {/* --------------------------- */}
            <h6 className="fw-bold mt-4">Value Trend Graph</h6>
            <canvas ref={chartRef} height="120"></canvas>
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
