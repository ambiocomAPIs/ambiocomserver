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

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ================= CRUD ================= */

// ✅ CREAR
router.post("/", crearRecepcionAlcohol);

// ✅ LISTAR (ESTA ERA LA QUE FALTABA)
router.get("/", obtenerRecepcionAlcohol);

// ✅ PLANTILLA
router.get("/plantilla-excel", descargaPlantillaExcel);

// ✅ CARGA MASIVA
router.post("/carga-masiva", upload.single("file"), cargarRecepcionAlcoholDesdeExcel);

// ✅ POR ID
router.get("/:id", obtenerRecepcionAlcoholPorId);
router.put("/:id", actualizarRecepcionAlcohol);
router.delete("/:id", eliminarRecepcionAlcohol);

export default router;
