import React, { useState } from "react";

export default function AddPreventiveTask({ onClose, onSave }) {
  const [form, setForm] = useState({
    assetCode: "",
    task: "",
    frequency: "Monthly",
    lastDone: "",
    nextDue: "",
    responsible: "",
    status: "Scheduled",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      ...form,
      _id: Date.now().toString(),
      type: "Inhouse", // used by calendar later
    };
    onSave(newTask);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
      style={{ zIndex: 1050 }}
    >
      <div className="bg-white rounded p-4 shadow" style={{ width: "500px" }}>
        <h5 className="mb-3">Add Preventive Task</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label">Asset Code</label>
            <input
              type="text"
              name="assetCode"
              className="form-control"
              value={form.assetCode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Task</label>
            <input
              type="text"
              name="task"
              className="form-control"
              value={form.task}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Frequency</label>
            <select
              name="frequency"
              className="form-select"
              value={form.frequency}
              onChange={handleChange}
            >
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="form-label">Last Done</label>
            <input
              type="date"
              name="lastDone"
              className="form-control"
              value={form.lastDone}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Next Due</label>
            <input
              type="date"
              name="nextDue"
              className="form-control"
              value={form.nextDue}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Responsible</label>
            <input
              type="text"
              name="responsible"
              className="form-control"
              value={form.responsible}
              onChange={handleChange}
            />
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
