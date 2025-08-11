import express from 'express';
import {
  crearEmpleado,
  obtenerEmpleados,
  actualizarEmpleado,
  eliminarEmpleado
} from '../controllers/EmpleadosAmbiocomController.js';

const router = express.Router();

router.post('/', crearEmpleado);
router.get('/', obtenerEmpleados);
router.put('/:id', actualizarEmpleado);
router.delete('/:id', eliminarEmpleado);

export default router;