import express from 'express';
import { crearMovimiento,obtenerMovimientos } from '../controllers/movimiento.controller.js';

const router = express.Router();

router.get('/movimientos', obtenerMovimientos);
router.post('/movimientos', crearMovimiento);

export default router;
