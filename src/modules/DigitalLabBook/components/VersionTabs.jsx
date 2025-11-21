import React from "react";

export default function VersionTabs({ columns = [], active, onSelect, onRemove }) {
  return (
    <ul className="nav nav-tabs mb-3">
      {/* Summary tab */}
      <li className="nav-item" style={{ marginRight: "6px" }}>
        <span
          onClick={() => onSelect("Summary")}
          className="nav-link d-flex align-items-center"
          style={{
            cursor: "pointer",
            backgroundColor: active === "Summary" ? "#0d6efd" : "",
            color: active === "Summary" ? "white" : "",
            borderColor: active === "Summary" ? "#0d6efd" : "",
            transition: "0.2s ease",
          }}
        >
          Summary
        </span>
      </li>

      {/* Variation tabs A, B, C, ... */}
      {columns.map((col, idx) => (
        <li key={col} className="nav-item" style={{ marginRight: "6px" }}>
          <span
            onClick={() => onSelect(col)}
            className="nav-link d-flex align-items-center"
            style={{
              cursor: "pointer",
              backgroundColor: active === col ? "#0d6efd" : "",
              color: active === col ? "white" : "",
              borderColor: active === col ? "#0d6efd" : "",
              transition: "0.2s ease",
            }}
          >
            Variation {col}

            {/* Remove icon (except A) */}
            {idx !== 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(col);
                }}
                style={{
                  marginLeft: "8px",
                  padding: "2px 5px",
                  borderRadius: "4px",
                  color: active === col ? "white" : "#777",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#fff";
                  e.target.style.background = "red";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = active === col ? "#fff" : "#777";
                  e.target.style.background = "transparent";
                }}
              >
                ×
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
