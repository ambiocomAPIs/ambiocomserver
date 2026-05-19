import express from "express";

import {
  createTrazabilidadLoteProduccion,
  updateTrazabilidadLoteProduccion,
  getTrazabilidadLoteProduccionByDate,
  getFechasTrazabilidadLoteProduccion,
  getAllTrazabilidadLoteProduccion,
  getLatestTrazabilidadLoteProduccion,
  deleteTrazabilidadLoteProduccion,
} from "../../controllers/ModuloLaboratorio/TrazabilidadRegistroDeLotesDeProduccionController.js";

const router = express.Router();

router.post("/", createTrazabilidadLoteProduccion);

router.get("/fechas", getFechasTrazabilidadLoteProduccion);

router.get("/by-date", getTrazabilidadLoteProduccionByDate);

router.get("/latest", getLatestTrazabilidadLoteProduccion);

router.get("/", getAllTrazabilidadLoteProduccion);

router.patch("/:id", updateTrazabilidadLoteProduccion);

router.delete("/:id", deleteTrazabilidadLoteProduccion);

export default router;