import React from "react";

export default function FormulaTable({
  activeVariation,
  variationData,
  setVariationData,
  markUnsaved, // ✅ from parent
}) {
  const rows = variationData[activeVariation]?.rows || [];

  /* ---------------------------------------------------------
      TOTALS (Percentage + Cost/kg)
  --------------------------------------------------------- */
  const totalPercent = rows.reduce((sum, row) => {
    return sum + (row.percentages?.[activeVariation] ?? 0);
  }, 0);

  const totalCost =
    rows.reduce((sum, row) => {
      const pct = row.percentages?.[activeVariation] ?? 0;
      const price = row.costPerKg ?? 0;
      return sum + (pct / 100) * price;
    }, 0) || 0;

  /* ---------------------------------------------------------
      UPDATE RM FIELDS — sync across ALL variations
      (does NOT mark unsaved on purpose)
  --------------------------------------------------------- */
  const updateRow = (index, field, value) => {
    setVariationData((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((v) => {
        if (updated[v].rows[index]) {
          updated[v].rows[index][field] = value;
        }
      });

      return updated;
    });
  };

  /* ---------------------------------------------------------
      UPDATE % — only affects active variation
      (DOES mark unsaved)
  --------------------------------------------------------- */
  const updatePercentage = (index, value) => {
    markUnsaved();

    setVariationData((prev) => {
      const updated = { ...prev };

      updated[activeVariation].rows[index].percentages = {
        ...updated[activeVariation].rows[index].percentages,
        [activeVariation]: Number(value),
      };

      return updated;
    });
  };

  /* ---------------------------------------------------------
      ADD ROW TO ALL VARIATIONS (unsaved)
  --------------------------------------------------------- */
  const addRow = () => {
    markUnsaved();

    setVariationData((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((v) => {
        updated[v].rows.push({
          itemCode: "",
          description: "",
          costPerKg: 0,
          percentages: {},
        });
      });

      return updated;
    });
  };

  /* ---------------------------------------------------------
      DELETE ROW FROM ALL VARIATIONS (unsaved)
  --------------------------------------------------------- */
  const deleteRow = (index) => {
    markUnsaved();

    setVariationData((prev) => {
      const updated = { ...prev };

      Object.keys(updated).forEach((v) => {
        updated[v].rows.splice(index, 1);
      });

      return updated;
    });
  };

  /* ---------------------------------------------------------
      RENDER TABLE
  --------------------------------------------------------- */
  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: "200px" }}>Item Code</th>
            <th>Description</th>
            <th style={{ width: "120px" }}>Cost / kg</th>
            <th style={{ width: "100px" }}>{activeVariation} (%)</th>
            <th style={{ width: "50px" }}></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {/* Item Code */}
              <td>
                <input
                  className="form-control"
                  value={row.itemCode ?? ""}
                  onChange={(e) =>
                    updateRow(index, "itemCode", e.target.value)
                  }
                />
              </td>

              {/* Description */}
              <td>
                <input
                  className="form-control"
                  value={row.description ?? ""}
                  onChange={(e) =>
                    updateRow(index, "description", e.target.value)
                  }
                />
              </td>

              {/* Cost/kg */}
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.costPerKg ?? 0}
                  onChange={(e) =>
                    updateRow(index, "costPerKg", Number(e.target.value))
                  }
                />
              </td>

              {/* Percentage */}
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.percentages?.[activeVariation] ?? ""}
                  onChange={(e) => updatePercentage(index, e.target.value)}
                />
              </td>

              {/* Delete */}
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteRow(index)}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}

          {/* TOTAL ROW */}
          <tr className="fw-bold bg-light">
            <td colSpan={2}>Totals</td>

            <td>{totalCost.toFixed(3)}</td>

            <td
              className={
                totalPercent === 100
                  ? "text-white bg-success fw-bold"
                  : "text-white bg-danger fw-bold"
              }
            >
              {totalPercent}%
            </td>

            <td></td>
          </tr>
        </tbody>
      </table>

      <button className="btn btn-primary btn-sm" onClick={addRow}>
        + Add Row
      </button>
    </div>
  );
}
