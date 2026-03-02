import { Router } from "express";
import {
  getProgramaciones,
  getProgramacionesByRango,
  getProgramacionById,
  createProgramacion,
  updateProgramacion,
  deleteProgramacion,
} from "../../../controllers/Modulo_Logistica/ProgramacionDespacho/programacionDespacho.controller.js";

const router = Router();

// ✅ primero las rutas “fijas”
router.get("/rango", getProgramacionesByRango);

// CRUD
router.get("/", getProgramaciones);
router.get("/:id", getProgramacionById);
router.post("/", createProgramacion);
router.put("/:id", updateProgramacion);
router.delete("/:id", deleteProgramacion);

export default router;