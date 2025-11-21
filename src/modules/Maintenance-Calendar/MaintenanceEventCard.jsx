import React from "react";

export default function MaintenanceEventCard({ task }) {
  const color =
    task.status === "Completed"
      ? "bg-success"
      : task.status === "Overdue"
      ? "bg-danger"
      : "bg-warning";

  return (
    <div
      className={`text-white small rounded px-1 py-0 mb-1 ${color}`}
      title={`${task.assetCode} – ${task.task}`}
      style={{ fontSize: "0.75rem", cursor: "pointer" }}
    >
      {task.assetCode} – {task.task}
    </div>
  );
}
