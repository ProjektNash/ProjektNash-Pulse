import express from "express";
import Formula from "../models/Formula.js";

const router = express.Router();

/* ---------------------------------------------------------
   CREATE FORMULA
--------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const formula = new Formula({
      ...req.body,

      createdByName: req.body.createdByName || req.body.createdBy || "Unknown",
      createdBy: req.body.createdBy || req.body.createdByName || "Unknown",
    });

    await formula.save();
    res.json(formula);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   GET ALL FORMULAS
--------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const formulas = await Formula.find().sort({ createdAt: -1 });
    res.json(formulas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   GET SINGLE FORMULA
--------------------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const formula = await Formula.findById(req.params.id);
    res.json(formula);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   UPDATE FORMULA (general save)
--------------------------------------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const {
      itemCode,
      description,
      notes,
      variations,
      variationData,
      createdBy,
      createdByName,
      status,
      targetDate,
    } = req.body;

    const updateFields = {
      itemCode,
      description,
      notes,
      variations,
      variationData,

      createdByName: createdByName || createdBy || "Unknown",
      createdBy: createdBy || createdByName || "Unknown",

      status,
      targetDate,
      updatedAt: Date.now(),
    };

    if (status === "Finished") {
      updateFields.finishedDate = new Date();
    }

    const updated = await Formula.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   UPLOAD PHOTO TO A VARIATION
   POST /api/formulas/:id/:variation/photos
--------------------------------------------------------- */
router.post("/:id/:variation/photos", async (req, res) => {
  try {
    const { image, fileName, contentType } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    const formula = await Formula.findById(req.params.id);
    if (!formula) {
      return res.status(404).json({ message: "Formula not found" });
    }

    const variation = req.params.variation;

    if (!formula.variationData.has(variation)) {
      return res.status(404).json({ message: "Variation not found" });
    }

    const variationObj = formula.variationData.get(variation);

    variationObj.photos.push({
      data: image,
      fileName,
      contentType,
      uploadedAt: new Date(),
    });

    formula.variationData.set(variation, variationObj);
    await formula.save();

    res.json({ message: "Photo saved", photos: variationObj.photos });
  } catch (err) {
    console.error("PHOTO UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   DELETE PHOTO FROM VARIATION
   DELETE /api/formulas/:id/:variation/photos/:index
--------------------------------------------------------- */
router.delete("/:id/:variation/photos/:index", async (req, res) => {
  try {
    const { id, variation, index } = req.params;

    const formula = await Formula.findById(id);
    if (!formula) {
      return res.status(404).json({ message: "Formula not found" });
    }

    if (!formula.variationData.has(variation)) {
      return res.status(404).json({ message: "Variation not found" });
    }

    const variationObj = formula.variationData.get(variation);

    if (!variationObj.photos || !variationObj.photos[index]) {
      return res.status(404).json({ message: "Photo not found" });
    }

    variationObj.photos.splice(index, 1);
    formula.variationData.set(variation, variationObj);
    await formula.save();

    res.json({ message: "Photo deleted", photos: variationObj.photos });
  } catch (err) {
    console.error("DELETE PHOTO ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
