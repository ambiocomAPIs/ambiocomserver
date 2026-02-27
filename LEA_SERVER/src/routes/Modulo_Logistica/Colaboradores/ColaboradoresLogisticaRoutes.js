import { Router } from "express";
import {
  getPersonal,
  createPersonal,
  updatePersonal,
  deletePersonal,
} from "../../../controllers/Modulo_Logistica/Colaboradores/ColaboradoresLogisticaController.js";

const router = Router();
router.get("/", getPersonal);
router.post("/", createPersonal);
router.put("/:id", updatePersonal);  
router.delete("/:id", deletePersonal);

export default router;