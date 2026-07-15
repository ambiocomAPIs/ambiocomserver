import { Router } from "express";
import multer from "multer";
import {
  crearDespachoAlcohol,
  obtenerDespachoAlcohol,
  obtenerDespachoAlcoholPorId,
  actualizarDespachoAlcohol,
  eliminarDespachoAlcohol,
  cargarDespachoAlcoholDesdeExcel,
  descargaPlantillaExcel,
  obtenerDespachoAlcoholByRango,
  actualizarEstadoVehiculoDespachoAlcohol,
  obtenerDespachosAlcoholBitacoraPorFecha,
} from "../../controllers/Modulo_Logistica/DespachoAlcoholesLogisticaController.js";

import {
  requireAuth,
  requireRole,
} from "../../middlewares/auth.middleware.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
});

router.patch(
  "/:id/estado",
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
  actualizarEstadoVehiculoDespachoAlcohol
);

// Obtener data en rango de fechas
router.get(
  "/rango",
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
  obtenerDespachoAlcoholByRango
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
  crearDespachoAlcohol
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
  obtenerDespachoAlcohol
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
  cargarDespachoAlcoholDesdeExcel
);

/*
 * BITÁCORA
 * GET /api/despacho-alcoholes/bitacora/resumen/2026-07-13
 * Esta ruta debe permanecer antes de /:id para que Express no
 * interprete "bitacora" como un identificador de MongoDB.
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
  obtenerDespachosAlcoholBitacoraPorFecha
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
  obtenerDespachoAlcoholPorId
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
  actualizarDespachoAlcohol
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
  eliminarDespachoAlcohol
);

export default router;
