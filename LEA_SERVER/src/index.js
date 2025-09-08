import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai'

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
import UsuariosAmbiocomExtrasRoutes from './routes/UsuariosAmbiocomExtrasRoutes.js'
import Tanques from './routes/TanquesRoutes.js'
import EmpleadosAmbiocomModels from './routes/EmpleadosAmbiocomRoutes.js';
import GraficaInsumosvsAlcoholes from './routes/GraficaInsumosvsAlcoholesRoutes.js';

import configuraciones from './config/config.js';

dotenv.config();

const app = express();
const PORT = configuraciones.PORT || 4040;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const imageDir = path.join(__dirname, '../public/imagenes');

// Crear carpeta si no existe
fs.mkdirSync(imageDir, { recursive: true });

// Middleware global CORS
const corsOptionsGlobal = {
  origin: [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://localhost:4041',
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

// Servir imágenes estáticas con CORS correcto
app.use('/imagenes', cors(corsOptionsForImages), express.static(imageDir));

// Configuración multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    const id = req.params.id;
    cb(null, `${id}.jpg`);
  }
});
const upload = multer({ storage });

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
app.use('/api/usuarios', UsuariosAmbiocomExtrasRoutes);
app.use('/api/tanques', Tanques);
app.use('/api/empleadosambiocom', EmpleadosAmbiocomModels);
app.use('/api/empleadosambiocom', EmpleadosAmbiocomModels);
app.use('/api/graficainsumoskgoh', GraficaInsumosvsAlcoholes);

app.post('/api/gemini/message', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en respuesta de Gemini:', response.status, errorText);
      return res.status(500).json({ error: 'Gemini API respondió con error' });
    }

    const data = await response.json();
    console.log('🧠 Respuesta completa de Gemini:', JSON.stringify(data, null, 2));

    let reply = '⚠️ Sin respuesta de Gemini';

    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0].content?.parts;
      if (parts?.length > 0 && parts[0].text) {
        reply = parts[0].text;
      }
    }

    res.json({ reply });
  } catch (error) {
    console.error('❌ Error en Gemini API:', error.message);
    res.status(500).json({ error: 'Error al contactar Gemini' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`conectado en el puerto: ${PORT}`);
});

export default app;
