import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function AddAreaModal({ show, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);

    // Simulate creating a new area locally
    const newArea = {
      id: uuidv4(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    if (onSaved) onSaved(newArea);

    setName("");
    setSaving(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <h5 className="fw-bold mb-3">Add Area</h5>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-control my-2"
              placeholder="Enter Area Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
