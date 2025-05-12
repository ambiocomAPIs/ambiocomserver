import express from 'express';
import { crearMovimientoTanque,GetMovimientoTanque } from '../controllers/ReporteOperacionesDeTanques.Controller.js';

const router = express.Router();

router.post('/operacionesdetanques', crearMovimientoTanque);
router.get('/veroperacionesdetanques', GetMovimientoTanque);

export default router;
