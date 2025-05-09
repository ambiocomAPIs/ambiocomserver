// routes/user.routes.js
import express from 'express';
const router = express.Router();
import {replaceAllDataColors, createDataColors,getAllDataColorss, getDataColorsById, updateDataColors, deleteDataColors} from '../controllers/dataColorsController.js'

// Ruta para crear un nuevo usuario
router.post('/dataColors', createDataColors);

// Ruta para reemplazar toda la dataColors
router.put('/dataColorsreplaceall', replaceAllDataColors);

// Ruta para obtener todos los usuarios
router.get('/dataColors', getAllDataColorss);

// Ruta para obtener un usuario por ID
router.get('/dataColors/:id', getDataColorsById);

// Ruta para actualizar un usuario
router.put('/dataColors/:id', updateDataColors);

// Ruta para eliminar un usuario
router.delete('/dataColors/:id', deleteDataColors);

export default router;

