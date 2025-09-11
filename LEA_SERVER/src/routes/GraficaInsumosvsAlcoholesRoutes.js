import express from "express";
import { crearGraficaInsumoskgoh, obtenerGraficaInsumoskgoh, obtenerGraficaInsumoscopoh, crearGraficaInsumoscopoh} from "../controllers/GraficaInsumosvsAlcoholesController.js";

const router = express.Router();

router.post("/guardarkilosporoh", crearGraficaInsumoskgoh);   // Guardar nueva producción
router.post("/guardarprecioporoh", crearGraficaInsumoscopoh);   // Guardar nueva producción
router.get("/listarkilosporoh", obtenerGraficaInsumoskgoh); // Listar producciones
router.get("/listarprecioporoh", obtenerGraficaInsumoscopoh); // Listar producciones

export default router;
