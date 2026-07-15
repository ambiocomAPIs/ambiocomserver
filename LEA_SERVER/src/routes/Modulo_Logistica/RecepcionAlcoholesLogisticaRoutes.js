import { Router } from "express";
import multer from "multer";
import {
  crearRecepcionAlcohol,
  obtenerRecepcionAlcohol,
  obtenerRecepcionAlcoholPorId,
  actualizarRecepcionAlcohol,
  eliminarRecepcionAlcohol,
  cargarRecepcionAlcoholDesdeExcel,
  descargaPlantillaExcel,
  obtenerRecepcionAlcoholExcel,
  obtenerRecepcionesAlcoholBitacoraPorFecha,
} from "../../controllers/Modulo_Logistica/RecepcionAlcoholesLogisticaController.js";

import {
  requireAuth,
  requireRole,
} from "../../middlewares/auth.middleware.js";

import {
  requireExcelApiKey,
} from "../../middlewares/excelApiKey.middleware.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
});

router.get(
  "/excel",
  requireExcelApiKey,
  obtenerRecepcionAlcoholExcel
);

// CREAR
router.post(
  "/",
  requireAuth,
  requireRole(
    "developer",
    "liderlogistica",
    "laboratorio",
    "gerente",
    "supervisor",
    "auxiliarlogistica1",
    "auxiliarlogistica2",
    "torrecontrollogistica"
  ),
  crearRecepcionAlcohol
);

// LISTAR
router.get(
  "/",
  requireAuth,
  requireRole(
    "developer",
    "liderlogistica",
    "laboratorio",
    "gerente",
    "supervisor",
    "auxiliarlogistica1",
    "auxiliarlogistica2",
    "torrecontrollogistica",
    "comercial"
  ),
  obtenerRecepcionAlcohol
);

// PLANTILLA
router.get(
  "/plantilla-excel",
  requireAuth,
  requireRole(
    "developer",
    "liderlogistica",
    "laboratorio",
    "gerente",
    "supervisor",
    "auxiliarlogistica1",
    "auxiliarlogistica2",
    "torrecontrollogistica"
  ),
  descargaPlantillaExcel
);

// CARGA MASIVA
router.post(
  "/carga-masiva",
  requireAuth,
  requireRole(
    "developer",
    "liderlogistica",
    "laboratorio",
    "gerente",
    "supervisor",
    "auxiliarlogistica1",
    "auxiliarlogistica2",
    "torrecontrollogistica"
  ),
  upload.single("file"),
  cargarRecepcionAlcoholDesdeExcel
);

/*
 * BITÁCORA
 * GET /api/recepcion-alcoholes/bitacora/resumen/2026-07-13
 * Esta ruta debe declararse antes de /:id para que Express no
 * interprete "bitacora" como si fuera un identificador de MongoDB.
 */
router.get(
  "/bitacora/resumen/:fecha",
  requireAuth,
  requireRole(
    "developer",
    "liderlogistica",
    "laboratorio",
    "gerente",
    "supervisor",
    "auxiliarlogistica1",
    "auxiliarlogistica2",
    "torrecontrollogistica",
    "comercial"
  ),
  obtenerRecepcionesAlcoholBitacoraPorFecha
);

// POR ID
router.get(
  "/:id",
  requireAuth,
  requireRole(
    "developer",
    "liderlogistica",
    "laboratorio",
    "gerente",
    "supervisor",
    "auxiliarlogistica1",
    "auxiliarlogistica2",
    "torrecontrollogistica"
  ),
  obtenerRecepcionAlcoholPorId
);

router.put(
  "/:id",
  requireAuth,
  requireRole(
    "developer",
    "liderlogistica",
    "laboratorio",
    "gerente",
    "supervisor",
    "auxiliarlogistica1",
    "auxiliarlogistica2",
    "torrecontrollogistica"
  ),
  actualizarRecepcionAlcohol
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(
    "developer",
    "liderlogistica",
    "laboratorio",
    "gerente",
    "supervisor",
    "auxiliarlogistica1",
    "auxiliarlogistica2",
    "torrecontrollogistica"
  ),
  eliminarRecepcionAlcohol
);

export default router;
