import { Router } from "express";
import {
  crearRegeneracionResina,
  obtenerRegeneracionesResina,
  obtenerRegeneracionResinaPorId,
} from "../../controllers/PTAP/regeneracionResina.controller.js";

const router = Router();

router.post("/", crearRegeneracionResina);
router.get("/", obtenerRegeneracionesResina);
router.get("/:id", obtenerRegeneracionResinaPorId);

export default router;