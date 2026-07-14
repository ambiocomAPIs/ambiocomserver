import express from "express";

import {
  deleteConsumoCombustibleByFecha,
  getConsumoCombustibleByFecha,
  getConsumosCombustiblesByRange,
  saveConsumoCombustibleByFecha,
  saveConsumosCombustiblesRange,
  getResumenConsumosCombustiblesParaBitacora
} from "../../controllers/Modulo_Produccion/consumoCombustiblesController.js";

const router = express.Router();

router.get("/rango", getConsumosCombustiblesByRange);

router.put("/rango", saveConsumosCombustiblesRange);

router.get("/:fecha", getConsumoCombustibleByFecha);

router.put("/:fecha", saveConsumoCombustibleByFecha);

router.delete("/:fecha", deleteConsumoCombustibleByFecha);

router.get("/bitacora/resumen/:fecha", getResumenConsumosCombustiblesParaBitacora);

export default router;