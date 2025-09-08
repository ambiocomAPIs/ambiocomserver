import express from "express";
import { crearGraficaInsumoskgoh, obtenerGraficaInsumoskgoh } from "../controllers/GraficaInsumosvsAlcoholesController.js";

const router = express.Router();

router.post("/guardar", crearGraficaInsumoskgoh);   // Guardar nueva producción
router.get("/", obtenerGraficaInsumoskgoh); // Listar producciones

export default router;
