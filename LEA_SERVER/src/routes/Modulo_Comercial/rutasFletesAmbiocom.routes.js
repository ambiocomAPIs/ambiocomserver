import express from "express";

import {
  obtenerMatrizActual,
  crearMatriz,
  guardarMatrizActual,
  actualizarMatrizPorId,
  actualizarTransportadoras,
  agregarFila,
  actualizarFila,
  eliminarFila,
  desactivarMatriz,
} from "../../controllers/Modulo_Comercial/rutasFletesAmbiocomController.js";

import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Consultar matriz activa
router.get("/", requireAuth, requireRole("developer", "gerente", "comercial"), obtenerMatrizActual);
// Crear nueva matriz
router.post("/", requireAuth, requireRole("developer", "gerente",  "comercial"), crearMatriz);
// Guardar/reemplazar matriz activa completa
router.put("/actual", requireAuth, requireRole("developer", "gerente",  "comercial"), guardarMatrizActual);
// Actualizar matriz específica completa
router.put("/:id", requireAuth, requireRole("developer", "gerente",  "comercial"), actualizarMatrizPorId);
// Actualizar columnas de transportadoras
router.patch("/:id/transportadoras", requireAuth, requireRole("developer", "gerente",  "comercial"), actualizarTransportadoras);
// Agregar fila
router.post("/:id/filas", requireAuth, requireRole("developer", "gerente",  "comercial"), agregarFila);
// Actualizar fila o celda
router.patch("/:id/filas/:rowId", requireAuth, requireRole("developer", "gerente",  "comercial"), actualizarFila);
// Eliminar fila
router.delete("/:id/filas/:rowId", requireAuth, requireRole("developer", "gerente",  "comercial"), eliminarFila);
// Desactivar matriz completa
router.delete("/:id", requireAuth, requireRole("developer", "gerente",  "comercial"), desactivarMatriz);

export default router;