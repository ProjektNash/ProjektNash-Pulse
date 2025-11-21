import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DigitalLabBook() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE;
  const BASE = import.meta.env.BASE_URL;

  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFormulas = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/formulas`);
      const data = await res.json();
      setFormulas(data);
    } catch (err) {
      console.error("Failed to load formulas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormulas();
  }, []);

  const handleCreate = () => {
    navigate(`${BASE}digital-lab-book/create`);
  };

  const handleOpenFormula = (id) => {
    navigate(`${BASE}digital-lab-book/builder/${id}`);
  };

  /* ---------------------------------------------------------
     UPDATE STATUS (Open → In Progress → Finished)
  --------------------------------------------------------- */
  const updateStatus = async (formulaId, newStatus) => {
    try {
      const formula = formulas.find((f) => f._id === formulaId);

      await fetch(`${API_BASE}/api/formulas/${formulaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formula,
          status: newStatus,
        }),
      });

      loadFormulas();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Digital Lab Book</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Projects</h5>
        <button className="btn btn-primary btn-sm" onClick={handleCreate}>
          + Create Project
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <p className="p-3">Loading projects...</p>
          ) : (
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Description</th>
                  <th>Created By</th>
                  <th>Created Date</th>
                  <th>Target Date</th>
                  <th>Finished Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {formulas.map((f) => (
                  <tr key={f._id}>
                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOpenFormula(f._id)}
                    >
                      {f.itemCode}
                    </td>

                    <td
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOpenFormula(f._id)}
                    >
                      {f.description}
                    </td>

                    <td>{f.createdByName || f.createdBy || "N/A"}</td>

                    <td>{new Date(f.createdAt).toLocaleDateString()}</td>

                    <td>
                      {f.targetDate
                        ? new Date(f.targetDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      {f.finishedDate
                        ? new Date(f.finishedDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={f.status || "Open"}
                        onChange={(e) => updateStatus(f._id, e.target.value)}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Finished">Finished</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

