import React, { useState, useEffect } from "react";
import AddBusinessPartner from "./AddBusinessPartner";

export default function BusinessPartners() {
  const [partners, setPartners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  // ✅ Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pn_businessPartners")) || [];
    setPartners(saved);
  }, []);

  // ✅ Save to localStorage
  const savePartners = (newList) => {
    setPartners(newList);
    localStorage.setItem("pn_businessPartners", JSON.stringify(newList));
  };

  // ✅ Add or update
  const handleSave = (partner) => {
    let updated;
    if (editingPartner) {
      updated = partners.map((p) => (p._id === partner._id ? partner : p));
    } else {
      updated = [...partners, partner];
    }
    savePartners(updated);
    setShowModal(false);
    setEditingPartner(null);
  };

  // ✅ Delete partner
  const handleDelete = (id) => {
    if (window.confirm("Delete this business partner?")) {
      const updated = partners.filter((p) => p._id !== id);
      savePartners(updated);
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

      {partners.length === 0 ? (
        <p className="text-muted">No business partners added yet.</p>
      ) : (
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Notes</th>
              <th style={{ width: "130px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p._id}>
                <td>{p.partnerName}</td>
                <td>{p.type}</td>
                <td>{p.contactPerson}</td>
                <td>{p.phone}</td>
                <td>{p.email}</td>
                <td>{p.notes}</td>
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
