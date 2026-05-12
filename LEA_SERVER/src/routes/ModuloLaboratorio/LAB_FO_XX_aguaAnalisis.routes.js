import { Router } from "express";
import {
  createAguaAnalisis,
  getAguaAnalisisByDate,
  getLatestAguaAnalisis,
  updateAguaAnalisis,
} from "../../controllers/ModuloLaboratorio/LAB_FO_XX_aguaAnalisis.controller.js";

const router = Router();

router.get("/latest", getLatestAguaAnalisis);
router.get("/by-date", getAguaAnalisisByDate);
router.post("/", createAguaAnalisis);
router.patch("/:id", updateAguaAnalisis);
router.put("/:id", updateAguaAnalisis);

export default router;