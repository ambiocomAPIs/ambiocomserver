import { Router } from "express";
import {
  crearColumnaAlcohol,
  listarColumnaAlcoholes,
  editarColumnaAlcohol,
  desactivarColumnaAlcohol,
} from "../../controllers/Modulo_Logistica/ColumnaDesapachoAlcoholesLogisticaController.js";

const router = Router();

router.get("/", listarColumnaAlcoholes,);
router.post("/", crearColumnaAlcohol);
router.put("/:id", editarColumnaAlcohol);
router.delete("/:id", desactivarColumnaAlcohol);

export default router;
