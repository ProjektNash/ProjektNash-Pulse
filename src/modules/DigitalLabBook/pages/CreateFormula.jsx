import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateFormula() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE;
  const BASE = import.meta.env.BASE_URL;

  const [form, setForm] = useState({
    itemCode: "",
    description: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStart = async () => {
    if (!form.itemCode.trim() || !form.description.trim()) {
      alert("Item Code and Description are required.");
      return;
    }

    const userObj = JSON.parse(localStorage.getItem("pnUser")) || {};
    const userName = userObj.fullName || userObj.username || "Unknown";

    try {
      const res = await fetch(`${API_BASE}/api/formulas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemCode: form.itemCode,
          description: form.description,
          notes: form.notes,
          variations: ["A"],
          variationData: {
            A: { notes: "", rows: [] },
          },

          createdByName: userName,
          createdBy: userName,
        }),
      });

      const data = await res.json();

      navigate(`${BASE}digital-lab-book/builder/${data._id}`);
    } catch (err) {
      console.error("Error creating formula:", err);
    }
  };

  return (
    <div className="container mt-4">

      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(`${BASE}digital-lab-book`)}
      >
        ← Back to Digital Lab Book
      </button>

      <h2 className="fw-bold mb-4">Create New Formula</h2>

      <div className="card shadow-sm">
        <div className="card-body">

          <div className="mb-3">
            <label className="form-label fw-bold">Item Code *</label>
            <input
              type="text"
              className="form-control"
              name="itemCode"
              value={form.itemCode}
              onChange={handleChange}
              placeholder="e.g., DEV001"
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
              placeholder="e.g., UV Flexo Black V2"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Notes (optional)</label>
            <textarea
              className="form-control"
              name="notes"
              rows="3"
              value={form.notes}
              onChange={handleChange}
            ></textarea>
          </div>

          <button className="btn btn-primary" onClick={handleStart}>
            Start Formula
          </button>

        </div>
      </div>
    </div>
  );
}
