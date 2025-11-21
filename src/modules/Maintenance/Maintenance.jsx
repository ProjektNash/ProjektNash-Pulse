import React, { useState, useEffect } from "react";
import AddMaintenanceJob from "./AddMaintenanceJob";

export default function Maintenance() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE;

  /* ==========================================================
     🔹 Load all maintenance jobs from backend
  ========================================================== */
  const loadJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/maintenance`);
      if (!res.ok) throw new Error("Failed to fetch maintenance jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("❌ Error loading jobs:", err);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  /* ==========================================================
     🔹 Add or update job
  ========================================================== */
  const handleSave = async (job) => {
    try {
      const method = job._id ? "PUT" : "POST";
      const url = job._id
        ? `${API_BASE}/api/maintenance/${job._id}`
        : `${API_BASE}/api/maintenance`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      if (!res.ok) throw new Error("Failed to save job");

      await loadJobs(); // reload list
      setShowModal(false);
      setEditingJob(null);
    } catch (err) {
      console.error("❌ Error saving job:", err);
      alert("Error saving job — please try again.");
    }
  };

  /* ==========================================================
     🔹 Delete job
  ========================================================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/maintenance/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete job");
      await loadJobs();
    } catch (err) {
      console.error("❌ Error deleting job:", err);
      alert("Error deleting job — please try again.");
    }
  };

  /* ==========================================================
     🔹 Format date (DD/MM/YYYY)
  ========================================================== */
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-secondary">Maintenance (Engineer Jobs)</h3>
        <button
          className="btn btn-success"
          onClick={() => {
            setEditingJob(null);
            setShowModal(true);
          }}
        >
          + Add Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <p className="text-muted">No maintenance jobs added yet.</p>
      ) : (
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Asset</th>
              <th>Job Type</th>
              <th>Engineer</th>
              <th>Booked Date</th>
              <th>Status</th>
              <th style={{ width: "130px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>
                  {job.assetName}
                  <div className="small text-muted">{job.assetCode}</div>
                </td>
                <td>{job.jobType || job.task}</td>
                <td>{job.engineer || job.supplier}</td>
                <td>{formatDate(job.bookedDate)}</td>
                <td>
                  <span
                    className={`badge ${
                      job.status === "Completed"
                        ? "bg-success"
                        : job.status === "Booked"
                        ? "bg-warning text-dark"
                        : "bg-secondary"
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => {
                        setEditingJob(job);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger flex-fill"
                      onClick={() => handleDelete(job._id)}
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
        <AddMaintenanceJob
          onClose={() => {
            setShowModal(false);
            setEditingJob(null);
          }}
          onSave={handleSave}
          existingJob={editingJob}
        />
      )}
    </div>
  );
}
