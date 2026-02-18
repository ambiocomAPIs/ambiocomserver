import { Router } from "express";
import {
  crearInforme,
  listarInformes,
  obtenerInformePorId,
  eliminarInforme,
} from "../controllers/InformeAlcohol.controller.js";

const router = Router();

router.post("/", crearInforme);
router.get("/", listarInformes);
router.get("/:id", obtenerInformePorId);
router.delete("/:id", eliminarInforme); // opcional

export default router;
