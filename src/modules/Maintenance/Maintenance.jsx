import React, { useState, useEffect } from "react";
import AddMaintenanceJob from "./AddMaintenanceJob";

export default function Maintenance() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Load saved jobs
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pn_maintenanceJobs")) || [];
    setJobs(saved);
  }, []);

  // Save updated jobs
  const saveJobs = (newJobs) => {
    setJobs(newJobs);
    localStorage.setItem("pn_maintenanceJobs", JSON.stringify(newJobs));
  };

  // Add or update job
  const handleSave = (job) => {
    let newJobs;
    if (editingJob) {
      newJobs = jobs.map((j) => (j._id === job._id ? job : j));
    } else {
      newJobs = [...jobs, job];
    }
    saveJobs(newJobs);
    setShowModal(false);
    setEditingJob(null);
  };

  // Delete job
  const handleDelete = (id) => {
    if (window.confirm("Delete this job?")) {
      const updated = jobs.filter((j) => j._id !== id);
      saveJobs(updated);
    }
  };

  // ✅ Format date as DD/MM/YYYY
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
              <th>Asset Code</th>
              <th>Task</th>
              <th>Supplier</th>
              <th>Booked Date</th>
              <th>Status</th>
              <th style={{ width: "130px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>{job.assetCode} – {job.assetName}</td>
                <td>{job.task}</td>
                <td>{job.supplier}</td>
                {/* 👇 Format Booked Date */}
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
