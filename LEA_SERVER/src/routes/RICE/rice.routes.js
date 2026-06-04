import express from "express";

import {
  getAllRiceItems,
  getRiceItemById,
  createRiceItem,
  updateRiceItem,
  deleteRiceItem,
  getRiceHistory,
  getRiceDashboard,
  getRiceItemsMesActualYAnterior,
} from "./../../controllers/RICE/rice.controller.js";

const router = express.Router();

router.get("/", getAllRiceItems);
router.get("/dashboard", getRiceDashboard);
router.get("/monthly", getRiceItemsMesActualYAnterior);

router.get("/:id", getRiceItemById);
router.get("/:id/historial", getRiceHistory);

router.post("/", createRiceItem);
router.put("/:id", updateRiceItem);
router.patch("/:id", updateRiceItem);
router.delete("/:id", deleteRiceItem);

export default router;