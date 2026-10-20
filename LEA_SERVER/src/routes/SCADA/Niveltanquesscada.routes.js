import express from "express";

import {
  crearNivel,
  obtenerNiveles,
  obtenerNivelesPorFecha,
  obtenerUltimoNivel,
  obtenerNivelesPorUnDia
} from "../../controllers/SCADA/Niveltanquesscada.controller.js";

const router = express.Router();

router.post("/", crearNivel);
router.get("/", obtenerNiveles);
router.get("/ultimo", obtenerUltimoNivel);
router.get("/rango-fechas", obtenerNivelesPorFecha);
router.get("/por-fecha/:fecha", obtenerNivelesPorUnDia);

export default router;