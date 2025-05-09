// routes/user.routes.js
import express from 'express';
const router = express.Router();
import {replaceAllData, createData,getAllDatas, getDataById, updateData, deleteData, reportarOperacion} from '../controllers/dataController.js'

// Ruta para crear un nuevo usuario
router.post('/data', createData);

// Ruta para reemplazar toda la data
router.post('/datareplaceall', replaceAllData);

// Ruta para obtener todos los usuarios
router.get('/data', getAllDatas);

// Ruta para obtener un usuario por ID
router.get('/data/:id', getDataById);

// Ruta para actualizar un usuario
router.put('/data/:id', updateData);

// Ruta para eliminar un usuario
router.delete('/data/:id', deleteData);

// Reportar consumo / inventario
router.post('/data/reportar-operacion', reportarOperacion);

export default router;

