import express from "express";
import {
  getTanques,
  createTanque,
  updateTanque,
  deleteTanque
} from "../controllers/TanquesController.js";

const router = express.Router();

router.get("/", getTanques);
router.post("/", createTanque);
router.put("/:id", updateTanque);
router.delete("/:id", deleteTanque);

export default router;
