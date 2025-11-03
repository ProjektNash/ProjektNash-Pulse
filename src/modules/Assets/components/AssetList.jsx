import React, { useState } from "react";
import AddAssetModal from "./AddAssetModal";

export default function AssetList({ assets, onDelete, onEdit }) {
  const [editingAsset, setEditingAsset] = useState(null);

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
              <th style={{ width: "10%" }}>Asset ID</th>
              <th style={{ width: "20%" }}>Name / Description</th>
              <th style={{ width: "15%" }}>Category</th>
              <th style={{ width: "10%" }}>Status</th>
              <th style={{ width: "15%" }}>Supplier</th>
              <th style={{ width: "10%" }}>Purchase Cost (£)</th>
              <th style={{ width: "10%" }}>Warranty Expiry</th>
              <th className="text-center" style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id || a._id}>
                <td className="fw-semibold">{a.assetCode || "-"}</td>
                <td>{a.name || "-"}</td>
                <td>{a.category || "-"}</td>
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
                    {a.status || "Active"}
                  </span>
                </td>
                <td>{a.supplier || "-"}</td>
                <td>
                  {a.purchaseCost
                    ? `£${Number(a.purchaseCost).toFixed(2)}`
                    : "-"}
                </td>
                <td>{a.warrantyExpiry || "-"}</td>
                <td className="text-center">
                  <button
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => setEditingAsset(a)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onDelete(a.id || a._id)}
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
          existingAsset={editingAsset} // prefill for editing
        />
      )}
    </>
  );
}
