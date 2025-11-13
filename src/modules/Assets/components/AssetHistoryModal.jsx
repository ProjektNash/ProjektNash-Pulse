import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AssetHistoryModal({ asset, onClose }) {
  if (!asset) return null;

  const history = asset.valueHistory || [];

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
            {history.length === 0 ? (
              <p className="text-secondary">No history available.</p>
            ) : (
              <table className="table table-bordered table-striped">
                <thead className="table-light">
                  <tr>
                    <th>Year</th>
                    <th>Inflation Rate (%)</th>
                    <th>Value (£)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, index) => (
                    <tr key={index}>
                      <td>{h.year}</td>
                      <td>{h.inflationRate}%</td>
                      <td>£{Number(h.value).toLocaleString()}</td>
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
