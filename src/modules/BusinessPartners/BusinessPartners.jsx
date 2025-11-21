import React, { useState, useEffect } from "react";
import AddBusinessPartner from "./AddBusinessPartner";

export default function BusinessPartners() {
  const [partners, setPartners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE;

  // ✅ Load from backend
  const loadPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/partners`);
      if (!res.ok) throw new Error("Failed to fetch business partners");
      const data = await res.json();
      setPartners(data);
      setError("");
    } catch (err) {
      console.error("❌ Error loading partners:", err);
      setError("Failed to load business partners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  // ✅ Add or update partner
  const handleSave = async (partner) => {
    try {
      const method = editingPartner ? "PUT" : "POST";
      const url = editingPartner
        ? `${API_BASE}/api/partners/${editingPartner._id}`
        : `${API_BASE}/api/partners`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partner),
      });

      if (!res.ok) throw new Error("Failed to save partner");
      await loadPartners();
      setShowModal(false);
      setEditingPartner(null);
    } catch (err) {
      console.error("❌ Error saving partner:", err);
      alert("Failed to save partner. Please try again.");
    }
  };

  // ✅ Delete partner
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this business partner?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/partners/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete partner");
      await loadPartners();
    } catch (err) {
      console.error("❌ Error deleting partner:", err);
      alert("Failed to delete partner.");
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-secondary">Business Partners</h3>
        <button
          className="btn btn-success"
          onClick={() => {
            setEditingPartner(null);
            setShowModal(true);
          }}
        >
          + Add Partner
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading partners...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : partners.length === 0 ? (
        <p className="text-muted">No business partners added yet.</p>
      ) : (
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Contacts</th>
              <th>Notes</th>
              <th style={{ width: "130px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p._id}>
                <td>{p.partnerName}</td>
                <td>{p.type}</td>
                <td>
                  {p.contacts && p.contacts.length > 0 ? (
                    p.contacts.map((c, i) => (
                      <div key={i}>
                        <strong>{c.name}</strong>
                        <div className="small text-muted">
                          {c.phone && <span>{c.phone}</span>}
                          {c.email && (
                            <>
                              {c.phone && " • "}
                              {c.email}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted">No contacts</span>
                  )}
                </td>
                <td>{p.notes || "-"}</td>
                <td>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => {
                        setEditingPartner(p);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger flex-fill"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <AddBusinessPartner
          onClose={() => {
            setShowModal(false);
            setEditingPartner(null);
          }}
          onSave={handleSave}
          existingPartner={editingPartner}
        />
      )}
    </div>
  );
}
