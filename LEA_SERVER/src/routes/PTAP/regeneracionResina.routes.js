import { Router } from "express";
import {
  actualizarRegeneracionResina,
  crearRegeneracionResina,
  eliminarRegeneracionResina,
  obtenerRegeneracionesResina,
  obtenerRegeneracionResinaPorId,
} from "../../controllers/PTAP/regeneracionResina.controller.js";

const router = Router();

router.post("/", crearRegeneracionResina);
router.get("/", obtenerRegeneracionesResina);
router.get("/:id", obtenerRegeneracionResinaPorId);
router.put("/:id", actualizarRegeneracionResina);
router.delete("/:id", eliminarRegeneracionResina);

export default router;
