import express from "express";

import {
  deleteIngresoCombustible,
  getIngresosCombustiblesDefault,
  getIngresosCombustiblesPorRango,
  postIngresoCombustible,
  putIngresoCombustible,
  putIngresosCombustiblesBulk,
  getResumenIngresosCombustiblesParaBitacora
} from "../../controllers/Modulo_Produccion/IngresoCombustibleCarbonyMaderaProduccion.controller.js";

const router = express.Router();

router.get("/", getIngresosCombustiblesDefault);

router.get("/rango", getIngresosCombustiblesPorRango);

router.post("/", postIngresoCombustible);

router.put("/bulk", putIngresosCombustiblesBulk);

router.put("/:id", putIngresoCombustible);

router.delete("/:id", deleteIngresoCombustible);

router.get(
  "/bitacora/resumen/:fecha",
  getResumenIngresosCombustiblesParaBitacora
);

export default router;