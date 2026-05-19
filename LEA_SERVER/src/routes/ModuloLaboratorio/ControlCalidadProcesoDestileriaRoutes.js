import express from "express";

import {
  createControlCalidadProcesoDestileria,
  getFechasControlCalidadProcesoDestileria,
  getControlCalidadProcesoDestileriaByDate,
  updateControlCalidadProcesoDestileria,
  getLatestControlCalidadProcesoDestileria,
  getAllControlCalidadProcesoDestileria,
  deleteControlCalidadProcesoDestileria,
} from "../../controllers/ModuloLaboratorio/ControlCalidadProcesoDestileriaController.js";

const router = express.Router();

router.post("/", createControlCalidadProcesoDestileria);

router.get("/fechas", getFechasControlCalidadProcesoDestileria);

router.get("/by-date", getControlCalidadProcesoDestileriaByDate);

router.get("/latest", getLatestControlCalidadProcesoDestileria);

router.get("/", getAllControlCalidadProcesoDestileria);

router.patch("/:id", updateControlCalidadProcesoDestileria);

router.delete("/:id", deleteControlCalidadProcesoDestileria);

export default router;