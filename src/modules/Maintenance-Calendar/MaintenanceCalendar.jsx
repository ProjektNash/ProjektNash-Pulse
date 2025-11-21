import React, { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import MaintenanceDayCell from "./MaintenanceDayCell";
import { sampleMaintenance } from "./sampleMaintenanceData";

export default function MaintenanceCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Build all 42 days for the calendar grid
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  // Group maintenance data by date (e.g. "2025-11-06")
  const grouped = sampleMaintenance.reduce((acc, task) => {
    const key = task.nextDue;
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  console.log("🗓 Days generated:", days.length); // should show 42
  console.log("🧩 Sample maintenance:", sampleMaintenance);

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          ← Prev
        </button>
        <h4>{format(currentMonth, "MMMM yyyy")}</h4>
        <button
          className="btn btn-outline-secondary"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          Next →
        </button>
      </div>

      <div className="border rounded overflow-hidden">
        {/* Week header */}
        <div className="d-flex fw-bold text-center border-bottom bg-light">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="flex-fill py-2 border-end"
              style={{ width: "14.28%" }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar body */}
        <div className="d-flex flex-wrap">
          {days.map((day, i) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const tasks = grouped[dayKey] || [];
            return (
              <div
                key={i}
                className="border p-1 bg-white"
                style={{
                  width: "14.28%",
                  height: "130px",
                  boxSizing: "border-box",
                }}
              >
                <MaintenanceDayCell date={day} tasks={tasks} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
