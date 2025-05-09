import express from 'express';
import multer from 'multer';
import { uploadPdf, updatePdf, getPdfByIndex, getDownPdfByIndex, deletePdfByIndex } from '../controllers/pdfController.js';

// Configuración de multer para almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Ruta para subir un PDF nuevo
router.post('/upload', upload.single('pdf'), uploadPdf);

// Ruta para actualizar un PDF existente por rowId
router.post('/update', upload.single('pdf'), updatePdf);  // Nueva ruta para actualizar el PDF

// Ruta para obtener un PDF por rowId
router.get('/:rowId', getPdfByIndex);

// Ruta para descargar un PDF por rowId
router.get('/download/:rowId', getDownPdfByIndex);

// Ruta para eliminar un PDF por rowId
router.delete('/:rowId', deletePdfByIndex);

export default router;
