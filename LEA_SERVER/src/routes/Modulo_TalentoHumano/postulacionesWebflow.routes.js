
import express from "express";

import {
  recibirPostulacionWebflow,
  listarPostulacionesWebflow,
  actualizarEstadoPostulacionWebflow,
  marcarPostulacionComoVistaWebflow,
} from "../../controllers/Modulo_TalentoHumano/postulacionesWebflow.controller.js";


const router = express.Router();


import { requireAuth, requireRole, } from "../../middlewares/auth.middleware.js";

router.post(
  "/webflow/webhook",
  recibirPostulacionWebflow
);


router.get(
  "/postulaciones",
  requireAuth,
  requireRole("developer", "gerente", "talentohumano"),
  listarPostulacionesWebflow
);

router.patch(
  "/postulaciones/:id/estado",
  requireAuth,
  requireRole("developer", "gerente", "talentohumano"),
  actualizarEstadoPostulacionWebflow
);

router.patch(
  "/postulaciones/:id/vista",
  requireAuth,
  requireRole("developer", "gerente", "talentohumano"),
  marcarPostulacionComoVistaWebflow
);


export default router;
