
import { Router } from "express";

import {
  consultarColeccionesCMS,
  consultarModeloColeccionCMS,
} from "../../../controllers/Modulo_TalentoHumano/WebflowService/webflowCMS.controller.js";

import {
  requireAuth,
  requireRole,
} from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/colecciones",
  requireAuth,
  requireRole("developer", "gerente", "talentohumano"),
  consultarColeccionesCMS
);

router.get(
  "/colecciones/:collectionId/modelo",
  requireAuth,
  requireRole("developer", "gerente", "talentohumano"),
  consultarModeloColeccionCMS
);

export default router;
