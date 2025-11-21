import React from "react";

export default function RawMaterialSelector({
  value,
  onChange,
  sapItems = [],
  labItems = [],
}) {
  return (
    <div>
      <select className="form-select form-select-sm" value={value} onChange={onChange}>
        <option value="">Select Raw Material...</option>

        {/* SAP Materials */}
        {sapItems.length > 0 && (
          <optgroup label="SAP Raw Materials">
            {sapItems.map((item) => (
              <option key={item.ItemCode} value={item.ItemCode}>
                {item.ItemCode} — {item.ItemName}
              </option>
            ))}
          </optgroup>
        )}

        {/* Lab Materials */}
        {labItems.length > 0 && (
          <optgroup label="Lab Materials (Non-SAP)">
            {labItems.map((item) => (
              <option key={item.tempCode} value={item.tempCode}>
                {item.tempCode} — {item.description}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}
