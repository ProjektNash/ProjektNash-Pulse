import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormulaTable from "../components/FormulaTable";
import SummaryTable from "../components/SummaryTable";
import VersionTabs from "../components/VersionTabs";
import imageCompression from "browser-image-compression";

export default function FormulaBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE;
  const BASE = import.meta.env.BASE_URL;

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const [createdByName, setCreatedByName] = useState("");

  const [status, setStatus] = useState("Open");
  const [targetDate, setTargetDate] = useState("");
  const [finishedDate, setFinishedDate] = useState("");

  const [columns, setColumns] = useState(["A"]);
  const [activeVariation, setActiveVariation] = useState("Summary");

  const [variationData, setVariationData] = useState({
    A: { notes: "", rows: [], photos: [] },
  });

  /* ---------------------------------------------------------
     FULLSCREEN VIEWER
  --------------------------------------------------------- */
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const openFullPhoto = (img) => setFullscreenImage(img);
  const closeFullPhoto = () => setFullscreenImage(null);

  /* ---------------------------------------------------------
     NOTES MODAL
  --------------------------------------------------------- */
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [modalVariation, setModalVariation] = useState("");
  const [modalNotes, setModalNotes] = useState("");

  const openVariationNotes = (variation) => {
    setModalVariation(variation);
    setModalNotes(variationData[variation]?.notes || "");
    setShowNotesModal(true);
  };

  const saveVariationNotes = () => {
    markUnsaved();
    setVariationData((prev) => ({
      ...prev,
      [modalVariation]: {
        ...prev[modalVariation],
        notes: modalNotes,
      },
    }));
    setShowNotesModal(false);
  };

  /* ---------------------------------------------------------
     PHOTOS MODAL (for SUMMARY view)
  --------------------------------------------------------- */
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoModalVariation, setPhotoModalVariation] = useState("");

  const openVariationPhotos = (variation) => {
    setPhotoModalVariation(variation);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setPhotoModalVariation("");
  };

  const markUnsaved = () => {
    setUnsavedChanges(true);
    setSaved(false);
  };

  /* ---------------------------------------------------------
     LOAD FORMULA
  --------------------------------------------------------- */
  const loadFormula = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/formulas/${id}`);
      const data = await res.json();

      setItemCode(data.itemCode);
      setDescription(data.description);
      setNotes(data.notes || "");
      setCreatedByName(data.createdByName || data.createdBy || "Unknown");

      setStatus(data.status || "Open");
      setTargetDate(data.targetDate ? data.targetDate.substring(0, 10) : "");

      setFinishedDate(
        data.finishedDate
          ? new Date(data.finishedDate).toLocaleDateString()
          : ""
      );

      const loadedColumns = data.variations?.length ? data.variations : ["A"];
      setColumns(loadedColumns);

      // Ensure each variation has notes, rows, and photos
      const rawVarData = data.variationData || {};
      const hydrated = {};
      loadedColumns.forEach((col) => {
        const v = rawVarData[col] || {};
        hydrated[col] = {
          notes: v.notes || "",
          rows: v.rows || [],
          photos: v.photos || [],
        };
      });

      setVariationData(hydrated);
      setActiveVariation("Summary");

      setUnsavedChanges(false);
      setSaved(false);
    } catch (err) {
      console.error("Failed to load formula:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormula();
  }, []);

  /* ---------------------------------------------------------
     SYNC RAW MATERIALS ACROSS VARIATIONS
  --------------------------------------------------------- */
  const syncRMAcrossVariations = () => {
    const updated = { ...variationData };
    const maxRows = Math.max(
      ...columns.map((col) => updated[col]?.rows?.length || 0)
    );

    const referenceVar =
      columns.find((col) => updated[col]?.rows?.length === maxRows) ||
      columns[0];

    for (let i = 0; i < maxRows; i++) {
      const rm = updated[referenceVar]?.rows?.[i] || {
        itemCode: "",
        description: "",
        costPerKg: 0,
      };

      columns.forEach((col) => {
        if (!updated[col])
          updated[col] = { notes: "", rows: [], photos: [] };
        if (!updated[col].rows[i]) {
          updated[col].rows[i] = {
            itemCode: "",
            description: "",
            costPerKg: 0,
            percentages: {},
          };
        }

        updated[col].rows[i].itemCode = rm.itemCode;
        updated[col].rows[i].description = rm.description;
        updated[col].rows[i].costPerKg = rm.costPerKg;
      });
    }

    setVariationData(updated);
  };

  /* ---------------------------------------------------------
     ADD VARIATION
  --------------------------------------------------------- */
  const addVariation = () => {
    markUnsaved();

    const nextLetter = String.fromCharCode(65 + columns.length);
    const newCols = [...columns, nextLetter];

    const referenceRows = variationData[columns[0]]?.rows || [];
    const clonedRows = referenceRows.map((row) => ({
      itemCode: row.itemCode,
      description: row.description,
      costPerKg: row.costPerKg,
      percentages: {},
    }));

    setVariationData((prev) => ({
      ...prev,
      [nextLetter]: { notes: "", rows: clonedRows, photos: [] },
    }));

    setColumns(newCols);
    setActiveVariation(nextLetter);
  };

  /* ---------------------------------------------------------
     REMOVE VARIATION
  --------------------------------------------------------- */
  const removeVariation = (col) => {
    if (col === "A") return;

    markUnsaved();
    setColumns(columns.filter((c) => c !== col));

    const updated = { ...variationData };
    delete updated[col];
    setVariationData(updated);

    if (activeVariation === col) {
      setActiveVariation("Summary");
    }
  };

  /* ---------------------------------------------------------
     SAVE FORMULA
  --------------------------------------------------------- */
  const saveChanges = async () => {
    try {
      await fetch(`${API_BASE}/api/formulas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemCode,
          description,
          notes,
          variations: columns,
          variationData,
          createdByName,
          createdBy: createdByName,
          status,
          targetDate,
        }),
      });

      setSaved(true);
      setUnsavedChanges(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Error saving formula:", err);
    }
  };

  /* ---------------------------------------------------------
     PHOTO UPLOAD HANDLING (PER VARIATION)
  --------------------------------------------------------- */
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const handlePhotoChange = async (e, variation) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    setPhotoUploading(true);

    try {
      // 1) Compress image
      const options = {
        maxSizeMB: 0.15, // ~150KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      const compressed = await imageCompression(file, options);
      const base64 = await imageCompression.getDataUrlFromFile(compressed);

      // 2) Build payload
      const fileName = `${itemCode || "formula"}-${variation}-${Date.now()}.webp`;
      const contentType = compressed.type || "image/webp";

      // 3) Send to backend
      const res = await fetch(
        `${API_BASE}/api/formulas/${id}/${variation}/photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64,
            fileName,
            contentType,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      // 4) Update local state with returned photos array
      setVariationData((prev) => ({
        ...prev,
        [variation]: {
          ...(prev[variation] || { notes: "", rows: [], photos: [] }),
          photos: data.photos || [],
        },
      }));
    } catch (err) {
      console.error("Photo upload error:", err);
      setPhotoError("Failed to upload photo. Please try again.");
    } finally {
      setPhotoUploading(false);
      // allow re-upload of same file
      e.target.value = "";
    }
  };

  /* ---------------------------------------------------------
     DELETE PHOTO
  --------------------------------------------------------- */
  const deletePhoto = async (variation, index) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/formulas/${id}/${variation}/photos/${index}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      setVariationData((prev) => ({
        ...prev,
        [variation]: {
          ...(prev[variation] || { notes: "", rows: [], photos: [] }),
          photos: data.photos || [],
        },
      }));
    } catch (err) {
      console.error("Delete photo error:", err);
      alert("Failed to delete photo. Please try again.");
    }
  };

  if (loading) {
    return <p className="p-3">Loading formula...</p>;
  }

  const isSummary = activeVariation === "Summary";
  const activeVarData = variationData[activeVariation] || {
    notes: "",
    rows: [],
    photos: [],
  };

  const photoModalData = photoModalVariation
    ? variationData[photoModalVariation] || { notes: "", rows: [], photos: [] }
    : { notes: "", rows: [], photos: [] };

  return (
    <div className="container mt-4">
      {saved && (
        <div className="alert alert-success text-center fw-bold">
          ✓ Formula Saved Successfully
        </div>
      )}

      <h2 className="fw-bold mb-3">Formula Builder</h2>

      {/* ⭐ COMPACT TOP SECTION */}
      <div className="card shadow-sm p-3 mb-3">
        <div className="row g-3">
          <div className="col-md-2">
            <label className="form-label fw-bold">Item Code</label>
            <input
              type="text"
              className="form-control"
              value={itemCode}
              onChange={(e) => {
                markUnsaved();
                setItemCode(e.target.value);
              }}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-bold">Description</label>
            <input
              type="text"
              className="form-control"
              value={description}
              onChange={(e) => {
                markUnsaved();
                setDescription(e.target.value);
              }}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">Status</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => {
                markUnsaved();
                setStatus(e.target.value);
              }}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Finished">Finished</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">Target Date</label>
            <input
              type="date"
              className="form-control"
              value={targetDate}
              onChange={(e) => {
                markUnsaved();
                setTargetDate(e.target.value);
              }}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label fw-bold">Finished Date</label>
            <input
              type="text"
              className="form-control"
              value={finishedDate || "—"}
              disabled
            />
          </div>
        </div>
      </div>

      <p className="text-muted small mb-3">Created by: {createdByName}</p>

      {/* PROJECT NOTES */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <h6 className="fw-bold">Project Notes</h6>
          <textarea
            className="form-control"
            rows="3"
            value={notes}
            onChange={(e) => {
              markUnsaved();
              setNotes(e.target.value);
            }}
          ></textarea>
        </div>
      </div>

      {/* VARIATION TABS */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <VersionTabs
          columns={columns}
          active={activeVariation}
          onSelect={(v) => {
            syncRMAcrossVariations();
            setActiveVariation(v);
          }}
          onRemove={removeVariation}
        />

        <button className="btn btn-primary btn-sm" onClick={addVariation}>
          + Add Variation
        </button>
      </div>

      {/* TABLES + VARIATION NOTES + PHOTOS */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          {isSummary ? (
            <SummaryTable
              columns={columns}
              variationData={variationData}
              setVariationData={setVariationData}
              markUnsaved={markUnsaved}
              openNotes={openVariationNotes}
              openPhotos={openVariationPhotos}  // ⭐ NEW
            />
          ) : (
            <>
              <FormulaTable
                activeVariation={activeVariation}
                variationData={variationData}
                setVariationData={setVariationData}
                markUnsaved={markUnsaved}
              />

              {/* NOTES FOR ACTIVE VARIATION */}
              <div className="card shadow-sm mt-3 mb-3">
                <div className="card-body">
                  <h6 className="fw-bold">
                    Notes for Variation {activeVariation}
                  </h6>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={activeVarData.notes || ""}
                    onChange={(e) => {
                      markUnsaved();
                      setVariationData((prev) => ({
                        ...prev,
                        [activeVariation]: {
                          ...(prev[activeVariation] || {
                            rows: [],
                            photos: [],
                          }),
                          notes: e.target.value,
                        },
                      }));
                    }}
                  ></textarea>
                </div>
              </div>

              {/* PHOTOS FOR ACTIVE VARIATION */}
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0">
                      Photos for Variation {activeVariation}
                    </h6>
                    <div>
                      <label className="btn btn-sm btn-outline-primary mb-0">
                        {photoUploading ? "Uploading..." : "+ Add Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handlePhotoChange(e, activeVariation)
                          }
                          disabled={photoUploading}
                        />
                      </label>
                    </div>
                  </div>

                  {photoError && (
                    <div className="alert alert-danger py-1 mb-2 small">
                      {photoError}
                    </div>
                  )}

                  {activeVarData.photos && activeVarData.photos.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {activeVarData.photos.map((p, idx) => (
                        <div
                          key={idx}
                          className="position-relative border rounded"
                          style={{
                            width: 120,
                            height: 120,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={p.data}
                            alt={p.fileName || `Photo ${idx + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              cursor: "pointer",
                            }}
                            onClick={() => openFullPhoto(p.data)}
                          />

                          {/* DELETE BUTTON */}
                          <button
                            className="btn btn-danger btn-sm position-absolute"
                            style={{
                              top: 5,
                              right: 5,
                              padding: "2px 6px",
                              fontSize: "0.7rem",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePhoto(activeVariation, idx);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">
                      No photos uploaded yet for this variation.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(`${BASE}digital-lab-book`)}
        >
          ← Back to Digital Lab Book
        </button>

        <button
          className={`btn fw-bold ${
            unsavedChanges ? "btn-warning" : "btn-success"
          }`}
          onClick={saveChanges}
        >
          {unsavedChanges ? "⚠️ Save Changes" : "Save Changes"}
        </button>
      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX */}
      {fullscreenImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.85)", zIndex: 9999 }}
          onClick={closeFullPhoto}
        >
          <img
            src={fullscreenImage}
            style={{
              maxWidth: "95%",
              maxHeight: "95%",
              borderRadius: 8,
            }}
          />
        </div>
      )}

      {/* NOTES MODAL */}
      {showNotesModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.65)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Notes for Variation {modalVariation}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowNotesModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <textarea
                  className="form-control"
                  rows="5"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={saveVariationNotes}
                >
                  Save Notes
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setShowNotesModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHOTOS MODAL (SUMMARY) */}
      {showPhotoModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.65)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Photos for Variation {photoModalVariation}
                </h5>
                <button className="btn-close" onClick={closePhotoModal}></button>
              </div>

              <div className="modal-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="small text-muted">
                    {photoModalData.photos?.length || 0} photo(s)
                  </div>
                  <div>
                    <label className="btn btn-sm btn-outline-primary mb-0">
                      {photoUploading ? "Uploading..." : "+ Add Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          handlePhotoChange(e, photoModalVariation)
                        }
                        disabled={photoUploading}
                      />
                    </label>
                  </div>
                </div>

                {photoError && (
                  <div className="alert alert-danger py-1 mb-2 small">
                    {photoError}
                  </div>
                )}

                {photoModalData.photos &&
                photoModalData.photos.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {photoModalData.photos.map((p, idx) => (
                      <div
                        key={idx}
                        className="position-relative border rounded"
                        style={{
                          width: 120,
                          height: 120,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={p.data}
                          alt={p.fileName || `Photo ${idx + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => openFullPhoto(p.data)}
                        />

                        <button
                          className="btn btn-danger btn-sm position-absolute"
                          style={{
                            top: 5,
                            right: 5,
                            padding: "2px 6px",
                            fontSize: "0.7rem",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhoto(photoModalVariation, idx);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small mb-0">
                    No photos uploaded yet for this variation.
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closePhotoModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
