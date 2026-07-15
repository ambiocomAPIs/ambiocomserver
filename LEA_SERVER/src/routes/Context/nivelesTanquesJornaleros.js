import express from "express";
import fileUpload from "express-fileupload";

import {
  obtenerNiveles,
  crearNivel,
  cargarExcelNivelesTanquesJornaleros,
  eliminarPorFechaRegistro,
  actualizarNivelesPorFecha,
  obtenerNivelesPorFecha,
  obtenerNivelesExcel,
  obtenerResumenNivelesTanquesBitacora,
} from "../../controllers/Context/nivelesTanquesJornalerosController.js";

import {
  requireAuth,
  requireRole,
} from "../../middlewares/auth.middleware.js";
import { requireExcelApiKey } from "../../middlewares/excelApiKey.middleware.js";

const router = express.Router();

router.get(
  "/excel",
  requireExcelApiKey,
  obtenerNivelesExcel
);

/*
 * Resumen utilizado por la bitácora de supervisores.
 * GET /api/tanquesjornaleros/bitacora/resumen/2026-07-13
 */
router.get(
  "/bitacora/resumen/:fecha",
  requireAuth,
  requireRole(
    "developer",
    "supervisor",
    "gerente",
    "comercial"
  ),
  obtenerResumenNivelesTanquesBitacora
);

router.get(
  "/nivelesdiariostanquesjornaleros",
  requireAuth,
  requireRole(
    "developer",
    "supervisor",
    "gerente",
    "comercial"
  ),
  obtenerNiveles
);

router.post(
  "/nivelesdiariostanquesjornaleros",
  requireAuth,
  requireRole("developer", "supervisor", "gerente"),
  crearNivel
);

router.delete(
  "/eliminarporfecha",
  requireAuth,
  requireRole("developer", "supervisor", "gerente"),
  eliminarPorFechaRegistro
);

router.get(
  "/porfecha/:fecha",
  requireAuth,
  requireRole("developer", "supervisor", "gerente"),
  obtenerNivelesPorFecha
);

router.put(
  "/actualizarporfecha",
  requireAuth,
  requireRole("developer", "supervisor", "gerente"),
  actualizarNivelesPorFecha
);

// Middleware necesario para manejar archivos.
router.use(fileUpload());

router.post(
  "/nivelesdiariostanquesjornaleros/uploadExcel",
  requireAuth,
  requireRole("developer", "supervisor", "gerente"),
  cargarExcelNivelesTanquesJornaleros
);

export default router;
