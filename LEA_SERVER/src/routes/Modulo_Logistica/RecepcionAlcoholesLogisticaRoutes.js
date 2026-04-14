import { Router } from "express";
import multer from "multer";
import {
  crearRecepcionAlcohol,
  obtenerRecepcionAlcohol,
  obtenerRecepcionAlcoholPorId,
  actualizarRecepcionAlcohol,
  eliminarRecepcionAlcohol,
  cargarRecepcionAlcoholDesdeExcel,
  descargaPlantillaExcel
} from "../../controllers/Modulo_Logistica/RecepcionAlcoholesLogisticaController.js";

import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });


//  CREAR
router.post("/", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"),crearRecepcionAlcohol);
//  LISTAR (ESTA ERA LA QUE FALTABA)
router.get("/", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"),obtenerRecepcionAlcohol);
// PLANTILLA
router.get("/plantilla-excel", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"),descargaPlantillaExcel);
// CARGA MASIVA
router.post("/carga-masiva", requireAuth,requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"), upload.single("file"), cargarRecepcionAlcoholDesdeExcel);
// POR ID
router.get("/:id", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"),obtenerRecepcionAlcoholPorId);
router.put("/:id",requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"), actualizarRecepcionAlcohol);
router.delete("/:id", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"),eliminarRecepcionAlcohol);

export default router;
