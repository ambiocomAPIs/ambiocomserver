import express from "express";

import {
  obtenerProveedoresLogistica,
  crearProveedorLogistica,
  actualizarProveedorLogistica,
  eliminarProveedorLogistica,
} from "../../../controllers/Modulo_Logistica/Proveedores/proveedoresLogisticaController.js";

const router = express.Router();

router.get("/", obtenerProveedoresLogistica);
router.post("/", crearProveedorLogistica);
router.put("/:id", actualizarProveedorLogistica);
router.delete("/:id", eliminarProveedorLogistica);

export default router;