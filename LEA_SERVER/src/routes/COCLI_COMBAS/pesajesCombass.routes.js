
import { Router } from "express";

import {
  obtenerPesajesCombass,
  obtenerPesajesCombassPorRango,
} from "../../controllers/COCLI_COMBAS/pesajesCombass.controller.js";

const router = Router();

router.get("/", obtenerPesajesCombass);
router.get("/rango", obtenerPesajesCombassPorRango);

export default router;
