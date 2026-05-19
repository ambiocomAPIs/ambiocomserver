import express from "express";

import {
  createTrazabilidadLaboratorio,
  getFechasTrazabilidadLaboratorio,
  updateTrazabilidadLaboratorio,
  getTrazabilidadLaboratorioByDate,
  getLatestTrazabilidadLaboratorio,
  getAllTrazabilidadLaboratorio,
  deleteTrazabilidadLaboratorio,
} from "../../controllers/ModuloLaboratorio/TrazabilidadLoteDeProduccionController.js";

const router = express.Router();

router.post("/", createTrazabilidadLaboratorio);

router.get("/fechas", getFechasTrazabilidadLaboratorio);

router.get("/by-date", getTrazabilidadLaboratorioByDate);

router.get("/latest", getLatestTrazabilidadLaboratorio);

router.get("/", getAllTrazabilidadLaboratorio);

router.patch("/:id", updateTrazabilidadLaboratorio);

router.delete("/:id", deleteTrazabilidadLaboratorio);

export default router;