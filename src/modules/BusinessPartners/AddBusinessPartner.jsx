import React, { useState, useEffect } from "react";

export default function AddBusinessPartner({ onClose, onSave, existingPartner }) {
  const [form, setForm] = useState({
    partnerName: "",
    type: "",
    contactPerson: "",
    phone: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    if (existingPartner) {
      setForm(existingPartner);
    }
  }, [existingPartner]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.partnerName.trim()) {
      alert("Please enter a business partner name.");
      return;
    }

    const newPartner = {
      ...form,
      _id: existingPartner ? existingPartner._id : Date.now().toString(),
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
        style={{ width: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h5 className="mb-3">
          {existingPartner ? "Edit Business Partner" : "Add Business Partner"}
        </h5>

        <form onSubmit={handleSubmit}>
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

          <div className="mb-3">
            <label className="form-label">Contact Person</label>
            <input
              type="text"
              name="contactPerson"
              className="form-control"
              value={form.contactPerson}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              className="form-control"
              rows="3"
              value={form.notes}
              onChange={handleChange}
            ></textarea>
          </div>

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
