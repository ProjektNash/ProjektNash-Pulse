import React, { useState } from "react";
import AssetList from "../components/AssetList";
import AddAssetModal from "../components/AddAssetModal";

export default function AreaAssets({ area, goBack }) {
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  // 🔹 Add new asset (local only)
  const handleAddAsset = (newAsset) => {
    const assetWithId = {
      ...newAsset,
      id: Date.now(),
      areaId: area._id || area.id,
    };
    setAssets((prev) => [...prev, assetWithId]);
  };

  // 🔹 Edit existing asset
  const handleEditAsset = (updatedAsset) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === updatedAsset.id || a._id === updatedAsset._id
          ? updatedAsset
          : a
      )
    );
  };

  // 🔹 Delete asset
  const handleDelete = (id) => {
    if (!window.confirm("Delete this asset?")) return;
    setAssets((prev) =>
      prev.filter((a) => a.id !== id && a._id !== id)
    );
  };

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
        onSave={editingAsset ? handleEditAsset : handleAddAsset}
        existingAsset={editingAsset}
      />
    </div>
  );
}
