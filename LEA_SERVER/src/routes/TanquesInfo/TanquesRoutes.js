import express from "express";
import {
  getTanques,
  createTanque,
  updateTanque,
  deleteTanque,
  getTanquesExcel
} from "../../controllers/TanquesInfo/TanquesController.js";

import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

import { requireExcelApiKey,} from "../../middlewares/excelApiKey.middleware.js";

const router = express.Router();

router.get("/excel", requireExcelApiKey,getTanquesExcel);

router.get("/",requireAuth, requireRole("developer","supervisor", "liderlogistica", "gerente" ,"auxiliarlogistica2","auxiliarlogistica1", "comercial"), getTanques);
router.post("/",requireAuth, requireRole("developer","supervisor", "gerente"), createTanque);
router.put("/:id",requireAuth, requireRole("developer","supervisor", "gerente"), updateTanque);
router.delete("/:id",requireAuth, requireRole("developer","supervisor", "gerente"), deleteTanque);

export default router;
