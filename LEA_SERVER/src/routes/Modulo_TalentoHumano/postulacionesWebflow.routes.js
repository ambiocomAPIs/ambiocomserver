
import express from "express";

import {
  recibirPostulacionWebflow,
} from "../../controllers/Modulo_TalentoHumano/postulacionesWebflow.controller.js";

const router = express.Router();

/* ===================================================
   WEBHOOK WEBFLOW
   Recibe automáticamente las postulaciones
=================================================== */

router.post(
  "/webflow/webhook",
  recibirPostulacionWebflow
);

export default router;
