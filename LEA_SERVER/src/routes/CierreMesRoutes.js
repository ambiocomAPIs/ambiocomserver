// routes/user.routes.js
import express from 'express';
const router = express.Router();
import { createCierreMes,getAllDatasCierreMes} from '../controllers/CierreMesController.js'

// Ruta para crear un nuevo usuario
router.post('/data', createCierreMes);

// Ruta para obtener todos los usuarios
router.get('/data', getAllDatasCierreMes);
;

export default router;

