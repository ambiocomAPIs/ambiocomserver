import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { OpenAI } from "openai";
import cookieParser from "cookie-parser";

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import db from "./db/db.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import sendEmail from "./routes/emailRouter.js";
import DataColors from "./routes/dataColorsRoutes.js";
import DownloadManual from "./routes/manualRoutes.js";
import movimientoRoutes from "./routes/movimiento.routes.js";
import CierreMes from "./routes/CierreMesRoutes.js";
import TanquesJornalerosSeguimiento from "./routes/TanquesJornalerosRoutes.js";
import ReportarOperacionesDeTanques from "./routes/operacionesDeTanques.Routes.js";
import NivelDiarioJornalerosLogistica from "./routes/nivelesTanquesJornaleros.js";
import BitacoraSupervisores from "./routes/BitacoraSupervisoresDiariaRoutes.js";
import notasBitacoraSupervisoresRoute from "./routes/notasBitacoraSupervisoresRoutes.js";
import UsuariosAmbiocomExtrasRoutes from "./routes/UsuariosAmbiocomExtrasRoutes.js";
import Tanques from "./routes/TanquesRoutes.js";
import EmpleadosAmbiocomModels from "./routes/EmpleadosAmbiocomRoutes.js";
import GraficaInsumosvsAlcoholes from "./routes/GraficaInsumosvsAlcoholesRoutes.js";
import MedidoresAgua from "./routes/medidoresAguaRoutes.js";
import ColumnaMedidoresAgua from "./routes/ColumnaMedidorRoutes.js";
import ColumnaMedidoresEnergia from "./routes/ColumnaMedidorEnergiaRoutes.js";
import MedidoresEnergia from "./routes/medidoresEnergiaRoutes.js";
import ColumnaIngresoCarbonMadera from "./routes/ColumnaIngresoCarbonMadera.js";
import ingresoCarbonMadera from "./routes/medidoresIngresoCarbonMadera.js";
//Modulo informes
import InformeAlcoholes from "./routes/informesAlcoholRoutes.js";
//Modulo_Logistica
import RecepcionAlcoholesLogistica from "./routes/Modulo_Logistica/RecepcionAlcoholesLogisticaRoutes.js";
import ColumnaRecepcionAlcoholesLogistica from "./routes/Modulo_Logistica/ColumnaRecepcionAlcoholesLogisticaRoutes.js";
import DespachoAlcoholesLogistica from "./routes/Modulo_Logistica/DespachoAlcoholesLogisticaRoutes.js";
import ColumnaDespachoAlcoholesLogistica from "./routes/Modulo_Logistica/ColumnaDespachoAlcoholesLogisticaRoutes.js";
import conductorRoutes from "./routes/Modulo_Logistica/Conductores/conductorRoutes.js";
import ProductoDespacho from "./routes/Modulo_Logistica/Producto/ProductoDespachoRoutes.js";
import DevCredentialValidation from "./routes/Dev_Functions/authDevCredentials.routes.js"
import ColaboradoresLogistica from "./routes/Modulo_Logistica/Colaboradores/ColaboradoresLogisticaRoutes.js"
import ClientesLogistica from "./routes/Modulo_Logistica/Clientes/ClientesLogisticaRoutes.js"
//autenticacion y login
import authRoutes from "./routes/Login/auth.routes.js";
import usersRoutes from "./routes/Login/users.routes.js";

import configuraciones from "./config/config.js";

dotenv.config();

const app = express();

// ✅ Render necesita process.env.PORT sí o sí
const PORT = process.env.PORT || configuraciones.PORT || 4040;

// ✅ Importante cuando estás detrás de proxy (Render) y manejas cookies/secure
app.set("trust proxy", 1);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const imageDir = path.join(__dirname, "../public/imagenes");

// Crear carpeta si no existe
fs.mkdirSync(imageDir, { recursive: true });

// Middleware global CORS
// ✅ OJO: cors no maneja bien Set aquí, mejor array
const allowedOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "https://ambiocomsassgc.netlify.app",
];

// ✅ Definición real de corsOptions (en tu código lo estabas usando pero no existía)
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
app.use(cookieParser());

// Middleware para logs y JSON
app.use(morgan("dev"));
app.use(express.json());

// Servir archivos estáticos públicos
app.use(express.static("public"));

// Orígenes permitidos para imágenes
const allowedOriginsForImages = [
  "http://localhost:5173",
  "https://ambiocomsassgc.netlify.app",
];

// CORS options específicos para imágenes
const corsOptionsForImages = {
  origin: allowedOriginsForImages,
  methods: ["GET", "HEAD"],
  optionsSuccessStatus: 200,
};

// Servir imágenes estáticas con CORS correcto
app.use("/imagenes", cors(corsOptionsForImages), express.static(imageDir));

// Configuración multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    const id = req.params.id;
    cb(null, `${id}.jpg`);
  },
});
const upload = multer({ storage });

// Rutas API
app.use("/api/pdfs", pdfRoutes);
app.use("/api/table", dataRoutes);
app.use("/api/email", sendEmail);
app.use("/api/tableColors", DataColors);
app.use("/api/download", DownloadManual);
app.use("/api/registro", movimientoRoutes);
app.use("/api/cierreMes", CierreMes);
app.use("/api/seguimientotanquesjornaleros", TanquesJornalerosSeguimiento);
app.use("/api/reportar", ReportarOperacionesDeTanques);
app.use("/api/tanquesjornaleros", NivelDiarioJornalerosLogistica);
app.use("/api/bitacora", BitacoraSupervisores);
app.use("/api/notasbitacora", notasBitacoraSupervisoresRoute);
app.use("/api/usuarios", UsuariosAmbiocomExtrasRoutes);
app.use("/api/tanques", Tanques);
app.use("/api/empleadosambiocom", EmpleadosAmbiocomModels);
app.use("/api/empleadosambiocom", EmpleadosAmbiocomModels);
app.use("/api/graficainsumosoh", GraficaInsumosvsAlcoholes);
app.use("/api/medidoresagua", MedidoresAgua);
app.use("/api/columnamedidoresagua", ColumnaMedidoresAgua);
app.use("/api/medidoresenergia", MedidoresEnergia);
app.use("/api/columnamedidoresenergia", ColumnaMedidoresEnergia);
app.use("/api/ingresocarbonmadera", ingresoCarbonMadera);
app.use("/api/columnaingresocarbonmadera", ColumnaIngresoCarbonMadera);
//Modulo Informes
app.use("/api/informes-alcoholes", InformeAlcoholes);
//Modulo Logistica
app.use("/api/recepcion-alcoholes", RecepcionAlcoholesLogistica);
app.use("/api/despacho-alcoholes", DespachoAlcoholesLogistica);
app.use("/api/columna-recepcion-alcoholes", ColumnaRecepcionAlcoholesLogistica);
app.use("/api/columna-despacho-alcoholes", ColumnaDespachoAlcoholesLogistica);
app.use("/api/conductores", conductorRoutes);
app.use("/api/alcoholesdespacho", ProductoDespacho);
app.use("/api/auth", DevCredentialValidation);
app.use("/api/personal", ColaboradoresLogistica);
app.use("/api/clienteslogistica", ClientesLogistica);
//autenticacion y login
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);


//==== CONSUMO BASE DE DATOS TEST / PRODUCTION (NO BORRAR) =====
app.get("/api/meta", (req, res) => {
  res.json({
    db: mongoose.connection.name,
    env: process.env.NODE_ENV,
  });
});
//==============================================================
//IA
app.post("/api/gemini/message", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      console.error("❌ Error en respuesta de Gemini:", response.status, errorText);
      return res.status(500).json({ error: "Gemini API respondió con error" });
    }

    const data = await response.json();
    console.log("🧠 Respuesta completa de Gemini:", JSON.stringify(data, null, 2));

    let reply = "⚠️ Sin respuesta de Gemini";

    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0].content?.parts;
      if (parts?.length > 0 && parts[0].text) {
        reply = parts[0].text;
      }
    }

    res.json({ reply });
  } catch (error) {
    console.error("❌ Error en Gemini API:", error.message);
    res.status(500).json({ error: "Error al contactar Gemini" });
  }
});

//
app.post("/api/informes-alcoholes", async (req, res) => {
  try {
    const body = req.body;

    // Validar fecha y zonas básicas
    if (!body.fecha || !Array.isArray(body.zonas)) {
      return res.status(400).json({ error: "Fecha y zonas son requeridas" });
    }

    // Crear nuevo documento
    const nuevoInforme = new InformeAlcoholHistorico(body);

    // Guardar en la DB
    await nuevoInforme.save();

    res.status(201).json({
      message: "Informe guardado correctamente",
      id: nuevoInforme._id,
    });
  } catch (error) {
    console.error("Error guardando informe:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

import { User } from "./models/Login/User.js";

app.post("/api/seed-users", async (req, res) => {
  try {
    const users = req.body;

    if (!Array.isArray(users)) {
      return res.status(400).json({ message: "Debe enviar un arreglo" });
    }

    let created = 0;

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) continue;

      const user = new User({
        email: u.email,
        rol: u.rol,
        isActive: true,
      });

      await user.setPassword(u.password); // 🔐 convierte a hash
      await user.save();

      created++;
    }

    res.json({ message: "Usuarios creados", created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`conectado en el puerto: ${PORT}`);
});

export default app;