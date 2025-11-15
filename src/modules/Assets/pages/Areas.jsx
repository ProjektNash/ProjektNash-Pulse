import React, { useEffect, useState } from "react";
import AddAreaModal from "../components/AddAreaModal";
import AreaAssets from "./AreaAssets";

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [assetCounts, setAssetCounts] = useState({});
  const [areaValues, setAreaValues] = useState({}); // Purchase values only (inflated removed)

  const API_BASE = import.meta.env.VITE_API_BASE;

  /* ==========================================================
     🔹 Load all areas + asset counts + purchase values
  =========================================================== */
  const loadAreas = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/areas`);
      if (!res.ok) throw new Error("Failed to fetch areas");
      const data = await res.json();
      setAreas(data);

      const counts = {};
      const values = {};

      await Promise.all(
        data.map(async (area) => {
          try {
            const assetRes = await fetch(`${API_BASE}/api/assets?areaId=${area._id}`);

            if (assetRes.ok) {
              const assetData = await assetRes.json();

              // Count assets
              counts[area._id] = assetData.length;

              // Total purchase cost (inflated removed)
              const totalValue = assetData.reduce((sum, asset) => {
                const cost = parseFloat(asset.purchaseCost) || 0;
                return sum + cost;
              }, 0);

              values[area._id] = totalValue;

            } else {
              counts[area._id] = 0;
              values[area._id] = 0;
            }
          } catch {
            counts[area._id] = 0;
            values[area._id] = 0;
          }
        })
      );

      setAssetCounts(counts);
      setAreaValues(values);

    } catch (err) {
      console.error("❌ Error loading areas:", err);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const handleAreaAdded = () => {
    loadAreas();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this area?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/areas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete area");
      await loadAreas();
    } catch (err) {
      console.error("❌ Error deleting area:", err);
      alert("Failed to delete area.");
    }
  };

  /* ==========================================================
     🔹 Handle area selection
  =========================================================== */
  if (selectedArea) {
    return (
      <AreaAssets
        area={selectedArea}
        goBack={() => {
          setSelectedArea(null);
          loadAreas(); // refresh list after returning
        }}
      />
    );
  }

  /* ==========================================================
     🔹 Areas Table
  =========================================================== */
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
                <th style={{ width: "40%" }}>Area Name</th>
                <th style={{ width: "10%" }} className="text-center">Assets</th>
                <th style={{ width: "20%" }} className="text-center">Value (£)</th>
                <th style={{ width: "30%" }} className="text-center">Actions</th>
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

                  <td className="text-center">{assetCounts[area._id] ?? "-"}</td>

                  {/* Purchase Value Only */}
                  <td className="text-center text-success fw-semibold">
                    £
                    {(areaValues[area._id] || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
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
