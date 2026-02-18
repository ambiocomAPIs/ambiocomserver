import { Router } from "express";
import {
  crearMedicionAgua,
  obtenerMedicionesAgua,
  obtenerMedicionAguaPorId,
  actualizarMedicionAgua,
  eliminarMedicionAgua,
} from "../controllers/medidoresAguaController.js";

const router = Router();

router.post("/", crearMedicionAgua);
router.get("/", obtenerMedicionesAgua);
router.get("/:id", obtenerMedicionAguaPorId);
router.put("/:id", actualizarMedicionAgua);
router.delete("/:id", eliminarMedicionAgua);

export default router;
