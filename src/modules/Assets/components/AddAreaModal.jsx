import React, { useState } from "react";

export default function AddAreaModal({ show, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Use your API base from .env
  const API_BASE = import.meta.env.VITE_API_BASE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);

    try {
      // 🔹 POST new area to backend
      const res = await fetch(`${API_BASE}/api/areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error("Failed to save area");
      const data = await res.json();

      console.log("✅ Area saved to database:", data.area);

      if (onSaved) onSaved(data.area);

      setName("");
      onClose();
    } catch (err) {
      console.error("❌ Error saving area:", err);
      alert("Error saving area. Please check your connection.");
    } finally {
      setSaving(false);
    }
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
