import { Router } from "express";
import {
  crearTutorial,
  obtenerTutoriales,
  obtenerTutorialPorId,
  actualizarTutorial,
  eliminarTutorial,
} from "../../controllers/ModalTutorialList/tutorialModalList.controller.js";

const router = Router();

router.post("/", crearTutorial);
router.get("/", obtenerTutoriales);
router.get("/:id", obtenerTutorialPorId);
router.put("/:id", actualizarTutorial);
router.delete("/:id", eliminarTutorial);

export default router;