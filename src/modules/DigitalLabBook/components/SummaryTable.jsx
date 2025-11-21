import React from "react";

export default function SummaryTable({
  columns,
  variationData,
  setVariationData,
  markUnsaved,
  openNotes,
  openPhotos,
}) {

  /* ---------------------------------------------------------
      MAX ROW COUNT ACROSS ALL VARIATIONS
  --------------------------------------------------------- */
  const maxRows = Math.max(
    ...columns.map((col) => variationData[col]?.rows?.length || 0)
  );

  /* ---------------------------------------------------------
      SAFE GET ROW (per variation)
  --------------------------------------------------------- */
  const getRow = (variation, index) => {
    const v = variationData[variation];
    if (!v || !v.rows[index]) {
      return {
        itemCode: "",
        description: "",
        costPerKg: 0,
        percentages: {},
      };
    }
    return v.rows[index];
  };

  /* ---------------------------------------------------------
      UPDATE SHARED RM FIELDS ACROSS ALL VARIATIONS
  --------------------------------------------------------- */
  const updateRow = (index, field, value) => {
    markUnsaved();

    setVariationData((prev) => {
      const updated = { ...prev };

      columns.forEach((col) => {
        if (!updated[col].rows[index]) {
          updated[col].rows[index] = {
            itemCode: "",
            description: "",
            costPerKg: 0,
            percentages: {},
          };
        }

        updated[col].rows[index][field] = value;
      });

      return updated;
    });
  };

  /* ---------------------------------------------------------
      UPDATE % FOR SPECIFIC VARIATION ONLY
  --------------------------------------------------------- */
  const updatePercentage = (variation, index, value) => {
    markUnsaved();

    setVariationData((prev) => {
      const updated = { ...prev };

      if (!updated[variation].rows[index]) {
        updated[variation].rows[index] = {
          itemCode: "",
          description: "",
          costPerKg: 0,
          percentages: {},
        };
      }

      updated[variation].rows[index].percentages[variation] = Number(value);

      return updated;
    });
  };

  /* ---------------------------------------------------------
      TOTALS PER VARIATION
  --------------------------------------------------------- */
  const calculateTotals = (variation) => {
    const rows = variationData[variation]?.rows || [];
    return rows.reduce(
      (sum, row) => sum + (row.percentages?.[variation] ?? 0),
      0
    );
  };

  /* ---------------------------------------------------------
      ADD ROW
  --------------------------------------------------------- */
  const addRow = () => {
    markUnsaved();
    setVariationData((prev) => {
      const updated = { ...prev };

      columns.forEach((col) => {
        updated[col].rows.push({
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
      DELETE ROW
  --------------------------------------------------------- */
  const deleteRow = (index) => {
    markUnsaved();
    setVariationData((prev) => {
      const updated = { ...prev };
      columns.forEach((col) => {
        updated[col].rows.splice(index, 1);
      });
      return updated;
    });
  };

  /* ---------------------------------------------------------
      RENDER SUMMARY TABLE
  --------------------------------------------------------- */
  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>Item Code</th>
            <th>Description</th>
            <th>Cost / kg</th>
            {columns.map((col) => (
              <th key={col}>{col} (%)</th>
            ))}
            <th></th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: maxRows }).map((_, index) => {
            const base = getRow(columns[0], index);

            return (
              <tr key={index}>
                {/* Item Code */}
                <td>
                  <input
                    className="form-control"
                    value={base.itemCode}
                    onChange={(e) =>
                      updateRow(index, "itemCode", e.target.value)
                    }
                  />
                </td>

                {/* Description */}
                <td>
                  <input
                    className="form-control"
                    value={base.description}
                    onChange={(e) =>
                      updateRow(index, "description", e.target.value)
                    }
                  />
                </td>

                {/* Cost per KG */}
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={base.costPerKg}
                    onChange={(e) =>
                      updateRow(index, "costPerKg", Number(e.target.value))
                    }
                  />
                </td>

                {/* Percentages per variation */}
                {columns.map((variation) => {
                  const row = getRow(variation, index);

                  return (
                    <td key={variation}>
                      <input
                        type="number"
                        className="form-control"
                        value={row.percentages?.[variation] ?? ""}
                        onChange={(e) =>
                          updatePercentage(variation, index, e.target.value)
                        }
                      />
                    </td>
                  );
                })}

                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteRow(index)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}

          {/* TOTALS ROW */}
          <tr className="fw-bold bg-light">
            <td colSpan={3}>Totals</td>

            {columns.map((variation) => {
              const total = calculateTotals(variation);
              return (
                <td
                  key={variation}
                  className={
                    total === 100
                      ? "text-white bg-success fw-bold"
                      : "text-white bg-danger fw-bold"
                  }
                >
                  {total}%
                </td>
              );
            })}

            <td></td>
          </tr>

          {/* NOTES + PHOTOS ROW */}
          <tr>
            <td colSpan={3}></td>

            {columns.map((variation) => (
              <td key={variation} className="text-center">
                <div className="d-flex flex-column gap-1">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => openNotes(variation)}
                  >
                    Notes
                  </button>

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => openPhotos(variation)}
                  >
                    Photos
                  </button>
                </div>
              </td>
            ))}

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
