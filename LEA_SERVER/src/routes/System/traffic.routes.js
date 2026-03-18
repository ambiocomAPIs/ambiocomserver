import express from "express";
import {
  getTrafficLogs,
  deleteTrafficLogs,
} from "../../controllers/System/traffic.controller.js";

const router = express.Router();

router.get("/", getTrafficLogs);
router.delete("/", deleteTrafficLogs);

export default router;