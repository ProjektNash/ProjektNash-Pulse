import React, { useState } from "react";

export default function CreateLabMaterial({ onClose, onSave }) {
  const [form, setForm] = useState({
    tempCode: "",
    description: "",
    supplier: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!form.tempCode.trim() || !form.description.trim()) {
      alert("Temp Code and Description are required.");
      return;
    }

    // Create new lab RM object
    const newLabMaterial = {
      id: Date.now(), // placeholder until backend exists
      ...form,
    };

    onSave(newLabMaterial);
  };

  return (
    <div className="modal fade show" style={{ display: "block" }}>
      <div className="modal-dialog modal-md">
        <div className="modal-content shadow">

          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Add Lab Raw Material</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body">

            <div className="mb-3">
              <label className="form-label fw-bold">Temp Code *</label>
              <input
                type="text"
                className="form-control"
                name="tempCode"
                value={form.tempCode}
                onChange={handleChange}
                placeholder="e.g., LAB123"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Description *</label>
              <input
                type="text"
                className="form-control"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Material description"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Supplier</label>
              <input
                type="text"
                className="form-control"
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Notes</label>
              <textarea
                className="form-control"
                name="notes"
                rows="3"
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional notes about this material"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Material
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
