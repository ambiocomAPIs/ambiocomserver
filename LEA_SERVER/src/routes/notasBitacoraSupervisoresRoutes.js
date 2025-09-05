import express from "express";
import {getNotes,createNote,toggleComplete, deleteNoteById, updateNoteById } from "../controllers/notasBitacoraSupervisoresController.js";

const router = express.Router();

router.get("/", getNotes);
router.post("/", createNote);
router.patch("/:id/toggle",toggleComplete);
router.patch("/bitacora/editarnota/:id",updateNoteById );
router.delete("/bitacora/:id", deleteNoteById);

export default router;
