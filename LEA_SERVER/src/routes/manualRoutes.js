import express from 'express';
const router = express.Router();

import {downloadManual} from '../controllers/manualController.js'

// Definir la ruta para la descarga del archivo PDF
router.get('/downloadmanual', downloadManual);

export default router;
