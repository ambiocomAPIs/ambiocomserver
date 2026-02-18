import { Router } from "express";
import {
  crearMedidor,
  listarMedidores,
  editarMedidor,
  desactivarMedidor,
} from "../controllers/ColumnaMedidorEnergiaController.js";

const router = Router();

router.get("/", listarMedidores);
router.post("/", crearMedidor);
router.put("/:id", editarMedidor);
router.delete("/:id", desactivarMedidor);

export default router;
