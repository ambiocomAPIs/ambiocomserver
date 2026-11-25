import express from "express";
import {
  getTanques,
  createTanque,
  updateTanque,
  deleteTanque,
} from "../../controllers/TanquesInfo/TanquesController.js";

import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";


const router = express.Router();

router.get("/",requireAuth, requireRole("developer","supervisor", "liderlogistica", "gerencialogistica", "gerente" ,"auxiliarlogistica2","auxiliarlogistica1", "comercial", "analistadecostoseinventarios", "laboratorio"), getTanques);
router.post("/",requireAuth, requireRole("developer","supervisor", "gerente"), createTanque);
router.put("/:id",requireAuth, requireRole("developer","supervisor", "gerente", "laboratorio", "analistadecostoseinventarios"), updateTanque);
router.delete("/:id",requireAuth, requireRole("developer","supervisor", "gerente"), deleteTanque);

export default router;
