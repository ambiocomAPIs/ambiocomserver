
import { Router } from "express";
import multer from "multer";

import {
  consultarColeccionesCMS,
  consultarModeloColeccionCMS,
  consultarVacantesCMS,
  registrarVacanteCMS,
  editarVacanteCMS,
  publicarVacanteWebflowCMS,
  cargarImagenVacanteCMS
} from "../../../controllers/Modulo_TalentoHumano/WebflowService/webflowCMS.controller.js";

import {
  requireAuth,
  requireRole,
} from "../../../middlewares/auth.middleware.js";

const router = Router();


const uploadImagenVacante = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 4 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (req, file, cb) => {
    const formatos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!formatos.includes(file.mimetype)) {
      return cb(
        new Error(
          "Solo se permiten imágenes JPG, PNG o WebP."
        )
      );
    }

    cb(null, true);
  },
});

const recibirImagenVacante = (req, res, next) => {
  uploadImagenVacante.single("imagen")(req, res, err => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message: err instanceof multer.MulterError &&
          err.code === "LIMIT_FILE_SIZE"
          ? "La imagen no puede superar los 4 MB."
          : err.message,
      });
    }

    next();
  });
};


router.get(
  "/colecciones",
  requireAuth,
  requireRole("developer", "talentohumano"),
  consultarColeccionesCMS
);

router.get(
  "/colecciones/:collectionId/modelo",
  requireAuth,
  requireRole("developer", "talentohumano"),
  consultarModeloColeccionCMS
);

router.get(
  "/vacantes",
  requireAuth,
  requireRole("developer", "talentohumano"),
  consultarVacantesCMS
);

router.post(
  "/vacantes",
  requireAuth,
  requireRole("developer", "talentohumano"),
  registrarVacanteCMS
);

router.patch(
  "/vacantes/:id",
  requireAuth,
  requireRole("developer", "talentohumano"),
  editarVacanteCMS
);

router.post(
  "/vacantes/:id/publicar",
  requireAuth,
  requireRole("developer", "talentohumano"),
  publicarVacanteWebflowCMS
);

router.post(
  "/vacantes/imagen",
  requireAuth,
  requireRole("developer", "talentohumano"),
  recibirImagenVacante,
  cargarImagenVacanteCMS
);

export default router;
