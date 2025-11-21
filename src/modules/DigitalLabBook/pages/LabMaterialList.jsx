import React, { useState } from "react";
import CreateLabMaterial from "./CreateLabMaterial";

export default function LabMaterialList() {
  const [showModal, setShowModal] = useState(false);

  // Placeholder until backend is wired
  const [labMaterials, setLabMaterials] = useState([
    { id: 1, tempCode: "LAB001", description: "Test Resin A" },
    { id: 2, tempCode: "LAB002", description: "Experimental Pigment B" },
  ]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Lab Raw Materials</h5>
        <button className="btn btn-success btn-sm" onClick={() => setShowModal(true)}>
          + Add Lab Material
        </button>
      </div>

      {/* List of Lab Materials */}
      <ul className="list-group">
        {labMaterials.map((item) => (
          <li key={item.id} className="list-group-item d-flex justify-content-between">
            <div>
              <strong>{item.tempCode}</strong>
              <div className="text-muted small">{item.description}</div>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal for creating a new lab material */}
      {showModal && (
        <CreateLabMaterial
          onClose={() => setShowModal(false)}
          onSave={(newItem) => {
            setLabMaterials([...labMaterials, newItem]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
