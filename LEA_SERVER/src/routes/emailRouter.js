import express from 'express';
const router = express.Router();

import {sendEmail, notificarProducto } from '../controllers/emailController.js'

router.post('/sendemail', sendEmail)
router.get('/notificar-producto/:productoId', notificarProducto)

export default router