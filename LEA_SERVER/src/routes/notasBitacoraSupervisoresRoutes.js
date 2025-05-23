import express from "express";
import {getNotes,createNote,toggleComplete} from "../controllers/notasBitacoraSupervisoresController.js";

const router = express.Router();

router.get("/", getNotes);
router.post("/", createNote);
router.patch("/:id/toggle",toggleComplete);

export default router;
