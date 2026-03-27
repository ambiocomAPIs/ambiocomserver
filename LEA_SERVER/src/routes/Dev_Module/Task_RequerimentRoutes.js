import { Router } from "express";
import {
  obtenerItems,
  obtenerItemsPorFecha,
  obtenerItemPorId,
  crearItem,
  actualizarItem,
  toggleCompletado,
  eliminarItem,
} from "../../controllers/Dev_Module/Task_RequerimentController.js";

const router = Router();

router.get("/", obtenerItems);
router.get("/por-fecha", obtenerItemsPorFecha);
router.get("/:id", obtenerItemPorId);
router.post("/", crearItem);
router.put("/:id", actualizarItem);
router.patch("/:id/toggle", toggleCompletado);
router.delete("/:id", eliminarItem);

export default router;