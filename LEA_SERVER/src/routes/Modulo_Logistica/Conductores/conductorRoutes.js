import express from "express";
import {
  crearConductor,
  obtenerConductores,
  obtenerConductor,
  actualizarConductor,
  eliminarConductor,
} from "../../../controllers/Modulo_Logistica/Conductores/conductorController.js";

const router = express.Router();

router.post("/", crearConductor);
router.get("/", obtenerConductores);
router.get("/:id", obtenerConductor);
router.put("/:id", actualizarConductor);
router.delete("/:id", eliminarConductor);

export default router;
