import React, { useState, useEffect } from "react";

export default function AddBusinessPartner({ onClose, onSave, existingPartner }) {
  const [form, setForm] = useState({
    partnerName: "",
    type: "",
    contacts: [{ name: "", phone: "", email: "" }],
    notes: "",
  });

  useEffect(() => {
    if (existingPartner) {
      setForm({
        partnerName: existingPartner.partnerName || "",
        type: existingPartner.type || "",
        contacts: existingPartner.contacts?.length
          ? existingPartner.contacts
          : [{ name: "", phone: "", email: "" }],
        notes: existingPartner.notes || "",
      });
    }
  }, [existingPartner]);

  // ✅ Handle partner-level field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle contact field changes
  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...form.contacts];
    updatedContacts[index][field] = value;
    setForm({ ...form, contacts: updatedContacts });
  };

  // ✅ Add a new blank contact
  const addContact = () => {
    setForm({
      ...form,
      contacts: [...form.contacts, { name: "", phone: "", email: "" }],
    });
  };

  // ✅ Remove a contact
  const removeContact = (index) => {
    const updated = form.contacts.filter((_, i) => i !== index);
    setForm({ ...form, contacts: updated.length ? updated : [{ name: "", phone: "", email: "" }] });
  };

  // ✅ Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.partnerName.trim()) {
      alert("Please enter a business partner name.");
      return;
    }

    const cleanedContacts = form.contacts.filter(
      (c) => c.name.trim() || c.phone.trim() || c.email.trim()
    );

    const newPartner = {
      ...form,
      contacts: cleanedContacts,
      _id: existingPartner ? existingPartner._id : undefined,
    };

    onSave(newPartner);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
      style={{ zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded p-4 shadow position-relative"
        style={{ width: "550px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h5 className="mb-3">
          {existingPartner ? "Edit Business Partner" : "Add Business Partner"}
        </h5>

        <form onSubmit={handleSubmit}>
          {/* Partner Name */}
          <div className="mb-3">
            <label className="form-label">Partner Name</label>
            <input
              type="text"
              name="partnerName"
              className="form-control"
              value={form.partnerName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Type Dropdown */}
          <div className="mb-3">
            <label className="form-label">Type</label>
            <select
              name="type"
              className="form-select"
              value={form.type}
              onChange={handleChange}
            >
              <option value="">-- Select Type --</option>
              <option value="Supplier">Supplier</option>
              <option value="Engineer">Engineer</option>
              <option value="OEM">OEM</option>
              <option value="Contractor">Contractor</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Contacts Section */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Contacts</label>
            {form.contacts.map((c, index) => (
              <div
                key={index}
                className="border rounded p-2 mb-2 bg-light position-relative"
              >
                <div className="mb-2">
                  <label className="form-label small mb-0">Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={c.name}
                    onChange={(e) =>
                      handleContactChange(index, "name", e.target.value)
                    }
                    placeholder="Contact name"
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small mb-0">Phone</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={c.phone}
                    onChange={(e) =>
                      handleContactChange(index, "phone", e.target.value)
                    }
                    placeholder="Phone number"
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label small mb-0">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={c.email}
                    onChange={(e) =>
                      handleContactChange(index, "email", e.target.value)
                    }
                    placeholder="Email address"
                  />
                </div>

                {form.contacts.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2"
                    onClick={() => removeContact(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm mt-1"
              onClick={addContact}
            >
              + Add Another Contact
            </button>
          </div>

          {/* Notes */}
          <div className="mb-3">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              className="form-control"
              rows="3"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional details (optional)"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {existingPartner ? "Save Changes" : "Add Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
