import express from 'express';
import {
  crearEmpleado,
  obtenerEmpleados,
  actualizarEmpleado,
  eliminarEmpleado
} from '../../controllers/Context/EmpleadosAmbiocomController.js';

import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/',requireAuth, requireRole("developer","supervisor","gerente"),crearEmpleado);
router.get('/', requireAuth, requireRole("developer","supervisor","gerente"),obtenerEmpleados); 
router.put('/:id', requireAuth, requireRole("developer","supervisor","gerente"),actualizarEmpleado);
router.delete('/:id', requireAuth, requireRole("developer","supervisor","gerente"),eliminarEmpleado);

export default router;