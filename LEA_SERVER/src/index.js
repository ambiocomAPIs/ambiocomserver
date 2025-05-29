import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// // Para obtener __dirname en ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

import db from './db/db.js';
import pdfRoutes from './routes/pdfRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import sendEmail from './routes/emailRouter.js';
import DataColors from './routes/dataColorsRoutes.js';
import DownloadManual from './routes/manualRoutes.js';
import movimientoRoutes from './routes/movimiento.routes.js';
import CierreMes from './routes/CierreMesRoutes.js';
import TanquesJornalerosSeguimiento from './routes/TanquesJornalerosRoutes.js';
import ReportarOperacionesDeTanques from './routes/operacionesDeTanques.Routes.js';
import NivelDiarioJornalerosLogistica from './routes/nivelesTanquesJornaleros.js';
import BitacoraSupervisores from './routes/BitacoraSupervisoresDiariaRoutes.js';
import notasBitacoraSupervisoresRoute from './routes/notasBitacoraSupervisoresRoutes.js';

import configuraciones from './config/config.js';

dotenv.config();

const app = express();
const PORT = configuraciones.PORT || 4040;

// const imageDir = path.join(__dirname, '../public/imagenes');

// // Crear carpeta si no existe
// fs.mkdirSync(imageDir, { recursive: true });

// Middleware global CORS
const corsOptionsGlobal = {
  origin: [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'https://ambiocomserver.onrender.com',
    'https://ambiocomsassgc.netlify.app'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptionsGlobal)); // middleware global CORS

// Middleware para logs y JSON
app.use(morgan('dev'));
app.use(express.json());

// Servir archivos estáticos públicos
app.use(express.static('public'));

// Orígenes permitidos para imágenes
const allowedOriginsForImages = [
  'http://localhost:5173',
  'https://ambiocomsassgc.netlify.app'
];

// CORS options específicos para imágenes
const corsOptionsForImages = {
  origin: allowedOriginsForImages,
  methods: ['GET', 'HEAD'],
  optionsSuccessStatus: 200
};

// // Servir imágenes estáticas con CORS correcto
// app.use('/imagenes', cors(corsOptionsForImages), express.static(imageDir));

// // Configuración multer para subir imágenes
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, imageDir);
//   },
//   filename: (req, file, cb) => {
//     const id = req.params.id;
//     cb(null, `${id}.jpg`);
//   }
// });
// const upload = multer({ storage });

// Rutas API
app.use('/api/pdfs', pdfRoutes);
app.use('/api/table', dataRoutes);
app.use('/api/email', sendEmail);
app.use('/api/tableColors', DataColors);
app.use('/api/download', DownloadManual);
app.use('/api/registro', movimientoRoutes);
app.use('/api/cierreMes', CierreMes);
app.use('/api/seguimientotanquesjornaleros', TanquesJornalerosSeguimiento);
app.use('/api/reportar', ReportarOperacionesDeTanques);
app.use('/api/tanquesjornaleros', NivelDiarioJornalerosLogistica);
app.use('/api/bitacora', BitacoraSupervisores);
app.use('/api/notasbitacora', notasBitacoraSupervisoresRoute);

// // Ruta para subir imagen
// app.post('/upload/:id', upload.single('image'), (req, res) => {
//   console.log('Archivo recibido:', req.file);
//   if (!req.file) {
//     return res.status(400).json({ error: 'No se subió ningún archivo' });
//   }
//   res.json({ success: true });
// });

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`conectado en el puerto: ${PORT}`);
});

export default app;
