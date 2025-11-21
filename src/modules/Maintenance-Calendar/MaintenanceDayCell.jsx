import React from "react";
import MaintenanceEventCard from "./MaintenanceEventCard";

export default function MaintenanceDayCell({ date, tasks }) {
  return (
    <div className="h-100 d-flex flex-column">
      <div className="fw-bold small">{date.getDate()}</div>
      <div className="flex-grow-1 overflow-auto">
        {tasks.map((t) => (
          <MaintenanceEventCard key={t._id} task={t} />
        ))}
      </div>
    </div>
  );
}
