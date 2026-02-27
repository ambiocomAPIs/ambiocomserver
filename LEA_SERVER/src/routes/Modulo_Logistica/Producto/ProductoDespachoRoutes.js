import { Router } from "express";
import {
  getAllAlcoholes,
  getAlcoholById,
  createAlcohol,
  updateAlcohol,
  deleteAlcohol,
} from "../../../controllers/Modulo_Logistica/Producto/ProductoDespachoControllers.js";

const router = Router();

// /api/alcoholes
router.get("/", getAllAlcoholes);
router.get("/:id", getAlcoholById);
router.post("/", createAlcohol);
router.put("/:id", updateAlcohol);
router.delete("/:id", deleteAlcohol);

export default router;
