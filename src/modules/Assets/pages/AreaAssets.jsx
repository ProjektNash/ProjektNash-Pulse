import React, { useEffect, useState } from "react";
import AssetList from "../components/AssetList";
import AddAssetModal from "../components/AddAssetModal";

export default function AreaAssets({ area, goBack }) {
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE;

  /* ==========================================================
     🔹 Load all assets for this area
  =========================================================== */
  const loadAssets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/assets?areaId=${area._id}`);
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error("❌ Error loading assets:", err);
    }
  };

  /* ==========================================================
     🔹 When the page loads or area changes
  =========================================================== */
  useEffect(() => {
    loadAssets();
  }, [area]);

  /* ==========================================================
     🔹 Edit existing asset (PUT)
  =========================================================== */
  const handleEditAsset = async (updatedAsset) => {
    try {
      const res = await fetch(`${API_BASE}/api/assets/${updatedAsset._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAsset),
      });
      if (!res.ok) throw new Error("Failed to update asset");
      await loadAssets(); // refresh after edit
    } catch (err) {
      console.error("❌ Error updating asset:", err);
      alert("Error updating asset.");
    }
  };

  /* ==========================================================
     🔹 Delete asset (DELETE)
  =========================================================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/assets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete asset");
      await loadAssets();
    } catch (err) {
      console.error("❌ Error deleting asset:", err);
      alert("Failed to delete asset.");
    }
  };

  /* ==========================================================
     🔹 Render
  =========================================================== */
  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-primary" onClick={goBack}>
          ← Back to Areas
        </button>

        <h4 className="mb-0 text-center flex-grow-1">{area.name}</h4>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingAsset(null);
            setShowModal(true);
          }}
        >
          + Add Asset
        </button>
      </div>

      {/* Assets Table */}
      <AssetList
        assets={assets}
        onDelete={handleDelete}
        onEdit={(asset) => {
          setEditingAsset(asset);
          setShowModal(true);
        }}
      />

      {/* Add/Edit Asset Modal */}
      <AddAssetModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={loadAssets} // ✅ only reload list after modal save
        existingAsset={editingAsset}
        areaId={area._id}
      />
    </div>
  );
}
