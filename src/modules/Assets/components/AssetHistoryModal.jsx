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
  const [history, setHistory] = useState(asset.valueHistory || []);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  /* ------------------------------------------------------
     Load history when modal opens
  ------------------------------------------------------ */
  useEffect(() => {
    setHistory(asset.valueHistory || []);
  }, [asset]);

  /* ------------------------------------------------------
     Draw / Update Chart.js line graph
  ------------------------------------------------------ */
  useEffect(() => {
    if (!history || history.length === 0) return;

    const years = history.map((h) => h.year);
    const values = history.map((h) => h.value);

    const ctx = chartRef.current.getContext("2d");

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
              label: (ctx) => "£" + Number(ctx.raw).toLocaleString(),
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

  if (!asset) return null;

  /* ------------------------------------------------------
     SUMMARY CALCULATIONS
  ------------------------------------------------------ */
  const firstValue = history.length > 0 ? history[0].value : 0;
  const lastValue = history.length > 0 ? history[history.length - 1].value : 0;
  const totalIncrease = lastValue - firstValue;
  const percentIncrease =
    firstValue > 0 ? ((totalIncrease / firstValue) * 100).toFixed(2) : 0;
  const avgAnnualGrowth =
    history.length > 1
      ? ((lastValue / firstValue) ** (1 / (history.length - 1)) - 1) * 100
      : 0;

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
            {/* -------------------------------- */}
            {/* READ-ONLY HISTORY TABLE */}
            {/* -------------------------------- */}
            {history.length === 0 ? (
              <p className="text-secondary">No history available.</p>
            ) : (
              <table className="table table-bordered table-striped align-middle mb-4">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "20%" }}>Year</th>
                    <th style={{ width: "25%" }}>Inflation Rate (%)</th>
                    <th style={{ width: "30%" }}>Value (£)</th>
                  </tr>
                </thead>
                <tbody>
                  {history
                    .slice()
                    .sort((a, b) => a.year - b.year)
                    .map((h, index) => (
                      <tr key={index}>
                        <td>{h.year}</td>
                        <td>{h.inflationRate}%</td>
                        <td>£{Number(h.value).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {/* -------------------------------- */}
            {/* VALUE TREND GRAPH */}
            {/* -------------------------------- */}
            <h6 className="fw-bold mt-4">Value Trend Graph</h6>
            <canvas ref={chartRef} height="120"></canvas>

            {/* -------------------------------- */}
            {/* SUMMARY SECTION */}
            {/* -------------------------------- */}
            <div className="card p-3 mt-4 bg-light">
              <h6 className="fw-bold mb-3">Summary</h6>

              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>Total Years:</strong> {history.length}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Total Increase:</strong>{" "}
                  £{totalIncrease.toLocaleString()}
                </div>

                <div className="col-md-6 mb-2">
                  <strong>% Increase Overall:</strong>{" "}
                  {percentIncrease}%
                </div>

                <div className="col-md-6 mb-2">
                  <strong>Avg Annual Growth:</strong>{" "}
                  {avgAnnualGrowth.toFixed(2)}%
                </div>
              </div>
            </div>
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
