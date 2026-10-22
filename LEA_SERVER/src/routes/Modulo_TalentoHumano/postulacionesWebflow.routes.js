
import express from "express";

import {
  recibirPostulacionWebflow,
} from "../../controllers/Modulo_TalentoHumano/postulacionesWebflow.controller.js";

const router = express.Router();

/*
  WEBHOOK WEBFLOW
  Recibe automáticamente una postulación
  cuando un aspirante envía el formulario.
*/

router.post(
  "/webflow/webhook",

  express.raw({
    type: "application/json",
    limit: "512kb",
  }),

  recibirPostulacionWebflow
);

export default router;
