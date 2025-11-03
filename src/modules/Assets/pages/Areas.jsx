import React, { useEffect, useState } from "react";
import AddAreaModal from "../components/AddAreaModal";
import AreaAssets from "./AreaAssets";

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [assetCounts, setAssetCounts] = useState({});

  const API_BASE = import.meta.env.VITE_API_BASE;

  // 🔹 Load all areas from backend
  const loadAreas = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/areas`);
      if (!res.ok) throw new Error("Failed to fetch areas");
      const data = await res.json();
      setAreas(data);

      // Optionally reset asset counts (if using later)
      const newCounts = {};
      data.forEach((a) => {
        newCounts[a._id] = assetCounts[a._id] || 0;
      });
      setAssetCounts(newCounts);
    } catch (err) {
      console.error("❌ Error loading areas:", err);
    }
  };

  // 🔹 When component loads
  useEffect(() => {
    loadAreas();
  }, []);

  // 🔹 When new area added, reload list
  const handleAreaAdded = () => {
    loadAreas();
  };

  // 🔹 Delete area (backend + local refresh)
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this area?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/areas/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete area");
      await loadAreas();
    } catch (err) {
      console.error("❌ Error deleting area:", err);
      alert("Failed to delete area.");
    }
  };

  // 🔹 Switch to AreaAssets view
  if (selectedArea) {
    return <AreaAssets area={selectedArea} goBack={() => setSelectedArea(null)} />;
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
                <tr key={area._id}>
                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedArea(area)}
                  >
                    {area.name || "Unnamed Area"}
                  </td>
                  <td className="text-center">
                    {assetCounts[area._id] ?? "-"}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(area._id)}
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
