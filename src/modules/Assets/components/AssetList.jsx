import React, { useState } from "react";
import AddAssetModal from "./AddAssetModal";
import AssetHistoryModal from "./AssetHistoryModal";

export default function AssetList({ assets, onDelete, onEdit, onRefresh }) {
  const [editingAsset, setEditingAsset] = useState(null);
  const [historyAsset, setHistoryAsset] = useState(null);

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
              <th>Warranty</th>
              <th>Inflated Value (£)</th>
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

                {/* ✅ Purchase Cost formatted the same as inflated value */}
                <td>
                  {a.purchaseCost
                    ? `£${Number(a.purchaseCost).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "-"}
                </td>

                <td>{a.warrantyExpiry || "-"}</td>

                {/* ✅ Inflated Value formatted with commas & 2 decimals */}
                <td>
                  {a.latestInflatedValue
                    ? `£${Number(a.latestInflatedValue).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`
                    : "-"}
                </td>

                <td className="text-center">
                  <button
                    className="btn btn-outline-info btn-sm me-2"
                    onClick={() => setHistoryAsset(a)}
                  >
                    Value History
                  </button>

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
