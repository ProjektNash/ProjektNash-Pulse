import React, { useState, useEffect } from "react";
import AddPreventiveTask from "./AddPreventiveTask";

export default function PreventiveMaintenance() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Load saved tasks
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pn_preventiveTasks")) || [];
    setTasks(saved);
  }, []);

  // Save updated list
  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem("pn_preventiveTasks", JSON.stringify(newTasks));
  };

  // Add new preventive task
  const handleAdd = (task) => {
    const newTasks = [...tasks, task];
    saveTasks(newTasks);
    setShowModal(false);
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-secondary">Preventive Maintenance (In-House)</h3>
        <button className="btn btn-success" onClick={() => setShowModal(true)}>
          + Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted">No preventive maintenance tasks added yet.</p>
      ) : (
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Asset Code</th>
              <th>Task</th>
              <th>Frequency</th>
              <th>Last Done</th>
              <th>Next Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t._id}>
                <td>{t.assetCode}</td>
                <td>{t.task}</td>
                <td>{t.frequency}</td>
                <td>{t.lastDone || "-"}</td>
                <td>{t.nextDue || "-"}</td>
                <td>
                  <span
                    className={`badge ${
                      t.status === "Completed"
                        ? "bg-success"
                        : t.status === "Overdue"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <AddPreventiveTask onClose={() => setShowModal(false)} onSave={handleAdd} />
      )}
    </div>
  );
}
