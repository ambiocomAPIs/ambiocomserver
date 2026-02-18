import { Router } from "express";
import multer from "multer";
import {
  crearDespachoAlcohol,
  obtenerDespachoAlcohol,
  obtenerDespachoAlcoholPorId,
  actualizarDespachoAlcohol,
  eliminarDespachoAlcohol,
  cargarDespachoAlcoholDesdeExcel,
  descargaPlantillaExcel
} from "../../controllers/Modulo_Logistica/DespachoAlcoholesLogisticaController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ================= CRUD ================= */

// ✅ CREAR
router.post("/", crearDespachoAlcohol);

// ✅ LISTAR (ESTA ERA LA QUE FALTABA)
router.get("/", obtenerDespachoAlcohol);

// ✅ PLANTILLA
router.get("/plantilla-excel", descargaPlantillaExcel);

// ✅ CARGA MASIVA
router.post("/carga-masiva", upload.single("file"), cargarDespachoAlcoholDesdeExcel);

// ✅ POR ID
router.get("/:id", obtenerDespachoAlcoholPorId);
router.put("/:id", actualizarDespachoAlcohol);
router.delete("/:id", eliminarDespachoAlcohol);

export default router;
