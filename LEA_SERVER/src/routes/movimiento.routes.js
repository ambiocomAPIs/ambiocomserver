import express from 'express';
import { crearMovimiento,obtenerMovimientos, eliminarMovimiento } from '../controllers/movimiento.controller.js';

const router = express.Router();

router.get('/movimientos', obtenerMovimientos);
router.post('/movimientos', crearMovimiento);
router.delete("/movimientos/:id", eliminarMovimiento); 

export default router;
