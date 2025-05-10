import express from 'express';
import { getTanquesData} from '../controllers/TanquesJornalerosController.js';

const router = express.Router();

// Ruta para obtener un PDF por rowId
router.get('/GetTanquesData', getTanquesData);

// Ruta temporal para insertar los tanques en la base de datos
//router.post('/seedTanques', seedTanquesData)

export default router;
