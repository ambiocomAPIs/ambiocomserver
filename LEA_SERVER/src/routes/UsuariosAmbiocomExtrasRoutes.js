// routes/usuarios.js
import express from 'express';
import { crearUsuario, obtenerUsuarios  } from '../controllers/UsuariosAmbiocomExtras.Controller.js';

const router = express.Router();

router.post('/crearUsuarioHorasExtras', crearUsuario);
router.get('/obtenerUsuarioHorasExtras', obtenerUsuarios);

export default router;
