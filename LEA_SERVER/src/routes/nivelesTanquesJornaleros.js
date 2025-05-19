import express from 'express';
import fileUpload from 'express-fileupload';

import { obtenerNiveles, crearNivel,cargarExcelNivelesTanquesJornaleros,eliminarPorFechaRegistro } from '../controllers/nivelesTanquesJornalerosController.js';

const router = express.Router();

router.get('/nivelesdiariostanquesjornaleros', obtenerNiveles);
router.post('/nivelesdiariostanquesjornaleros', crearNivel);
router.delete('/eliminarporfecha', eliminarPorFechaRegistro);
// Middleware necesario para manejar archivos (solo si no lo tienes global)
router.use(fileUpload());
router.post('/nivelesdiariostanquesjornaleros/uploadExcel', cargarExcelNivelesTanquesJornaleros);

export default router;
