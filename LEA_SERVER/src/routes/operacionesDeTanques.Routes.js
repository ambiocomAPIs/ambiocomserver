import express from 'express';
import { crearMovimientoTanque } from '../controllers/ReporteOperacionesDeTanques.Controller.js';

const router = express.Router();

router.post('/operacionesdetanques', crearMovimientoTanque);

export default router;
