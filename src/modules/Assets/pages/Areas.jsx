import React, { useState } from "react";
import AddAreaModal from "../components/AddAreaModal";
import AreaAssets from "./AreaAssets";

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [assetCounts, setAssetCounts] = useState({});

  // 🔹 Handle area added
  const handleAreaAdded = (newArea) => {
    setAreas((prev) => [...prev, newArea]);
    setAssetCounts((prev) => ({ ...prev, [newArea.id || newArea._id || Date.now()]: 0 }));
  };

  // 🔹 Delete area
  const handleDelete = (id) => {
    if (!window.confirm("Delete this area?")) return;
    setAreas((prev) => prev.filter((a) => a.id !== id && a._id !== id));
    setAssetCounts((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  // 🔹 Switch to AreaAssets view
  if (selectedArea) {
    return (
      <AreaAssets
        area={selectedArea}
        goBack={() => setSelectedArea(null)}
      />
    );
  }

  // 🔹 Main table view
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 fw-semibold">Asset Areas</h4>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Area
        </button>
      </div>

      {areas.length === 0 ? (
        <p className="text-secondary">No areas added yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle shadow-sm">
            <thead className="table-light">
              <tr>
                <th style={{ width: "50%" }}>Area Name</th>
                <th style={{ width: "20%" }} className="text-center">
                  Assets
                </th>
                <th style={{ width: "30%" }} className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.id || area._id}>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedArea(area)}
                  >
                    {area.name || "Unnamed Area"}
                  </td>
                  <td className="text-center">
                    {assetCounts[area.id || area._id] ?? "-"}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(area.id || area._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Area Modal */}
      <AddAreaModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={handleAreaAdded}
      />
    </div>
  );
}
