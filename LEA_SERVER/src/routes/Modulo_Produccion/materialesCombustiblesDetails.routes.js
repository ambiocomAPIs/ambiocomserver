import express from "express";

import {
  actualizarMaterialCombustible,
  cambiarEstadoMaterialCombustible,
  crearMaterialCombustible,
  eliminarMaterialCombustible,
  obtenerMaterialesCombustibles,
  obtenerMaterialesCombustiblesActivos,
} from "../../controllers/Modulo_Produccion/materialesCombustiblesDetails.Controller.js";

const router = express.Router();

router.get("/", obtenerMaterialesCombustibles);
router.get("/activos", obtenerMaterialesCombustiblesActivos);
router.post("/", crearMaterialCombustible);
router.put("/:id", actualizarMaterialCombustible);
router.patch("/:id/toggle", cambiarEstadoMaterialCombustible);
router.delete("/:id", eliminarMaterialCombustible);

export default router;