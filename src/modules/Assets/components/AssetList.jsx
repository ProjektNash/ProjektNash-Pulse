import React, { useState, useEffect } from "react";
import AddAssetModal from "./AddAssetModal";
import AssetHistoryModal from "./AssetHistoryModal";

export default function AssetList({ assets, onDelete, onEdit, onRefresh }) {
  const [editingAsset, setEditingAsset] = useState(null);
  const [historyAsset, setHistoryAsset] = useState(null);

  /* ==========================================================
      🔥 Event bridge for AddAssetModal → open History Modal
  =========================================================== */
  useEffect(() => {
    window.openAssetHistory = (asset) => {
      setHistoryAsset(asset);
    };
  }, []);

  /* ==========================================================
      Format date → DD/MM/YYYY
  =========================================================== */
  const formatDate = (value) => {
    if (!value) return "-";

    const dt = new Date(value);
    if (isNaN(dt)) return value;

    const d = String(dt.getDate()).padStart(2, "0");
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const y = dt.getFullYear();

    return `${d}/${m}/${y}`;
  };

  const handleEditSave = (updatedAsset) => {
    onEdit(updatedAsset);
    setEditingAsset(null);
  };

  if (!assets || assets.length === 0) {
    return <p className="text-secondary">No assets added for this area yet.</p>;
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Asset ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Supplier</th>
              <th>Purchase Cost (£)</th>
              <th>Warranty Expiry</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((a) => (
              <tr key={a.id || a._id}>
                <td className="fw-semibold">{a.assetCode}</td>
                <td>{a.name}</td>
                <td>{a.category}</td>

                <td>
                  <span
                    className={`badge ${
                      a.status === "Active"
                        ? "bg-success"
                        : a.status === "Out of Service"
                        ? "bg-warning text-dark"
                        : "bg-secondary"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>

                <td>{a.supplier}</td>

                <td>
                  {a.purchaseCost
                    ? `£${Number(a.purchaseCost).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "-"}
                </td>

                {/* ✔ Format warranty date nicely */}
                <td>{formatDate(a.warrantyExpiry)}</td>

                <td className="text-center">
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => setEditingAsset(a)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onDelete(a._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingAsset && (
        <AddAssetModal
          show={true}
          onClose={() => setEditingAsset(null)}
          onSave={handleEditSave}
          existingAsset={editingAsset}
        />
      )}

      {/* History Modal */}
      {historyAsset && (
        <AssetHistoryModal
          asset={historyAsset}
          onClose={() => setHistoryAsset(null)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}
