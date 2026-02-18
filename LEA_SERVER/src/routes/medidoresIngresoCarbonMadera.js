import { Router } from "express";
import {
  crearIngresoCarbonMadera,
  obtenerIngresoCarbonMadera,
  obtenerIngresoCarbonMaderaPorId,
  actualizarIngresoCarbonMadera,
  eliminarIngresoCarbonMadera,
} from "../controllers/medidoresIngresoCarbonMaderaController.js";

const router = Router();

router.post("/", crearIngresoCarbonMadera);
router.get("/", obtenerIngresoCarbonMadera);
router.get("/:id", obtenerIngresoCarbonMaderaPorId);
router.put("/:id", actualizarIngresoCarbonMadera);
router.delete("/:id", eliminarIngresoCarbonMadera);

export default router;
