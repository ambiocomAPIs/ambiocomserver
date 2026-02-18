import { Router } from "express";
import {
  crearRecepcionAlcohol,
  listarRecepcionAlcoholes,
  editarRecepcionAlcohol,
  desactivarRecepcionAlcohol,
} from "../../controllers/Modulo_Logistica/ColumnaRecepcionAlcoholesLogisticaController.js";

const router = Router();

router.get("/", listarRecepcionAlcoholes,);
router.post("/", crearRecepcionAlcohol);
router.put("/:id", editarRecepcionAlcohol);
router.delete("/:id", desactivarRecepcionAlcohol);

export default router;
