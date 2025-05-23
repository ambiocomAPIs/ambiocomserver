import express from 'express';
import morgan from 'morgan'
import cors from 'cors';
import dotenv from 'dotenv';

import TanquesJornaleros from './models/TanquesJornalerosModels.js';
import NivelDiarioJornalerosLogisticaModel from './models/nivelesTanquesJornalerosModels.js';
import Movimiento from '../src/models/movimiento.model.js'


import db from './db/db.js';
import pdfRoutes from './routes/pdfRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import sendEmail  from './routes/emailRouter.js';
import DataColors from './routes/dataColorsRoutes.js';
import DownloadManual from './routes/manualRoutes.js';
import movimientoRoutes from './routes/movimiento.routes.js';
import CierreMes from './routes/CierreMesRoutes.js';
import TanquesJornalerosSeguimiento from './routes/TanquesJornalerosRoutes.js';
import ReportarOperacionesDeTanques from './routes/operacionesDeTanques.Routes.js';
import NivelDiarioJornalerosLogistica from './routes/nivelesTanquesJornaleros.js';
import BitacoraSupervisores from './routes/BitacoraSupervisoresDiariaRoutes.js';
import notasBitacoraSupervisoresRoute from './routes/notasBitacoraSupervisoresRoutes.js'

import configuraciones from './config/config.js'
const app = express();
const PORT = configuraciones.PORT || 4040
dotenv.config();

//static files
app.use(express.static('public'))
//middleware
app.use(cors()); //comunica la api con el servidor y ciertos dominios
app.use(morgan('dev'))
app.use(express.json()); //* middleware- analiza solicitudes entrantes con cargas JSON y se basa en body-parser

const corsOptions = {
    origin: ['http://127.0.0.1:5173', 'https://ambiocomserver.onrender.com'],
    optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));

//*Rutas
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
app.use('/api/bitacora', BitacoraSupervisores)
app.use('/api/notasbitacora', notasBitacoraSupervisoresRoute)

// ***************************************************************
// Endpoint para agregar cantidadIngreso
app.put('/agregar-cantidad-ingreso', async (req, res) => {
  try {
    const result = await Movimiento.updateMany(
      { cantidadIngreso: { $exists: false } }, // Solo si no existe
      { $set: { cantidadIngreso: "1" } } // Agregar como string
    );

    res.status(200).json({
      message: 'Campo cantidadIngreso agregado exitosamente',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error actualizando documentos:', error);
    res.status(500).json({ message: 'Error actualizando los documentos' });
  }
});

// Endpoint temporal para agregar la columna FechaRegistro
app.post('/agregar-fecha-registro', async (req, res) => {
  try {
    // Encontramos todos los documentos en la colección
    const registros = await NivelDiarioJornalerosLogisticaModel.find();

    // Iteramos sobre cada documento para agregar el campo FechaRegistro
    for (const registro of registros) {
      // Extraemos la fecha de createdAt
      const fecha = new Date(registro.createdAt);
      // Convertimos la fecha a formato yyyy-mm-dd (sin hora)
      const fechaRegistro = fecha.toISOString().split('T')[0];  // Ejemplo: "2025-05-13"

      // Actualizamos el registro con el nuevo campo FechaRegistro
      registro.FechaRegistro = fechaRegistro;

      // Guardamos el registro actualizado
      await registro.save();
    }

    // Respuesta exitosa
    res.status(200).json({ message: 'Campo FechaRegistro agregado correctamente a todos los registros.' });
  } catch (error) {
    console.error('Error al agregar FechaRegistro:', error);
    res.status(500).json({ message: 'Hubo un error al agregar el campo FechaRegistro.' });
  }
});

app.listen(PORT, ()=> {
    console.log(`conectado en el puerto: ${PORT}`);
})

export default app;