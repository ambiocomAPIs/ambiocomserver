import { Router } from "express";
import {
  getProgramaciones,
  getProgramacionesByRango,
  getProgramacionById,
  createProgramacion,
  updateProgramacion,
  deleteProgramacion,
  updateCumplidoProgramacion
} from "../../../controllers/Modulo_Logistica/ProgramacionDespacho/programacionDespacho.controller.js";

import { requireAuth, requireRole } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/rango", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica2", "torrecontrollogistica"), getProgramacionesByRango);

// CRUD
router.get("/",requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica2", "torrecontrollogistica"), getProgramaciones);
router.get("/:id", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica2", "torrecontrollogistica"), getProgramacionById);
router.post("/", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica2", "torrecontrollogistica"), createProgramacion);
router.put("/:id", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica2", "torrecontrollogistica"), updateProgramacion);
router.delete("/:id",requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica2", "torrecontrollogistica"), deleteProgramacion);
router.patch("/:id/cumplido", requireAuth, requireRole("developer","liderlogistica","laboratorio","gerente","supervisor","auxiliarlogistica2", "torrecontrollogistica"), updateCumplidoProgramacion);

export default router;