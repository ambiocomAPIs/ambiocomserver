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
  obtenerDespachoAlcoholByRango
} from "../../controllers/Modulo_Logistica/DespachoAlcoholesLogisticaController.js";

import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

//obtener data en rango de fechas
router.get("/rango",requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"), obtenerDespachoAlcoholByRango);
// CREAR
router.post("/", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"),crearDespachoAlcohol);
// LISTAR (ESTA ERA LA QUE FALTABA)
router.get("/",requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"), obtenerDespachoAlcohol);
// PLANTILLA
router.get("/plantilla-excel",requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"), descargaPlantillaExcel);
// CARGA MASIVA
router.post("/carga-masiva",requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"), upload.single("file"), cargarDespachoAlcoholDesdeExcel);
// POR ID
router.get("/:id",requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"), obtenerDespachoAlcoholPorId);
router.put("/:id",requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"), actualizarDespachoAlcohol);
router.delete("/:id",requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica1","auxiliarlogistica2", "torrecontrollogistica"), eliminarDespachoAlcohol);

export default router;
