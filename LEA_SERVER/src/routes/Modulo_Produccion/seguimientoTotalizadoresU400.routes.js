import express from "express";

import {
  obtenerSeguimientoTotalizadoresU400Actual,
  obtenerSeguimientoTotalizadoresU400PorMes,
  obtenerVentanaSeguimientoTotalizadoresU400,
  listarHistoricoSeguimientosTotalizadoresU400,
  autoguardarSeguimientoTotalizadoresU400,
  autoguardarVentanaSeguimientoTotalizadoresU400,
  guardarSeguimientoTotalizadoresU400PorMes,
  cerrarSeguimientoTotalizadoresU400,
  eliminarSeguimientoTotalizadoresU400,
  obtenerResumenDiarioTotalizadoresParaBitacora
} from "../../controllers/Modulo_Produccion/seguimientoTotalizadoresU400Controller.js";

const router = express.Router();

router.get("/", obtenerSeguimientoTotalizadoresU400Actual);
router.get("/historico", listarHistoricoSeguimientosTotalizadoresU400);
router.get("/ventana/:mes", obtenerVentanaSeguimientoTotalizadoresU400);
router.get("/mes/:mes", obtenerSeguimientoTotalizadoresU400PorMes);
router.put("/autosave", autoguardarSeguimientoTotalizadoresU400);
router.put("/autosave-ventana", autoguardarVentanaSeguimientoTotalizadoresU400);
router.put("/mes/:mes", guardarSeguimientoTotalizadoresU400PorMes);
router.patch("/mes/:mes/cerrar", cerrarSeguimientoTotalizadoresU400);
router.delete("/mes/:mes", eliminarSeguimientoTotalizadoresU400);
router.get(
  "/bitacora/resumen-diario/:fecha",
  obtenerResumenDiarioTotalizadoresParaBitacora
);

export default router;
