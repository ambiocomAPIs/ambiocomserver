import mongoose from "mongoose";

import {
  ESTADOS_RICE,
  TIPOS_ACTIVIDAD,
  CARRILES_RICE,
  HISTORIAL_TIPOS,
} from "./rice.constants.js";

const HistoryChangeSchema = new mongoose.Schema(
  {
    campo: {
      type: String,
      required: true,
      trim: true,
    },
    anterior: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },
    nuevo: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const HistoryEntrySchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: HISTORIAL_TIPOS,
      required: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      default: "",
      trim: true,
    },
    usuario: {
      type: String,
      default: "Sistema",
      trim: true,
    },
    cambios: {
      type: [HistoryChangeSchema],
      default: [],
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const RiceItemSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio."],
      trim: true,
    },
    descripcion: {
      type: String,
      default: "",
      trim: true,
    },
    tipoActividad: {
      type: String,
      enum: TIPOS_ACTIVIDAD,
      default: "Requerimiento",
    },
    carril: {
      type: String,
      enum: CARRILES_RICE,
      default: "Carril 1 — Operativo",
    },
    areaSolicitante: {
      type: String,
      default: "Gerencia Operaciones",
      trim: true,
    },
    solicitadoPor: {
      type: String,
      default: "",
      trim: true,
    },
    alcance: {
      type: Number,
      default: 1,
      min: 0,
    },
    impacto: {
      type: Number,
      default: 1,
      min: 0,
    },
    confianza: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },
    esfuerzo: {
      type: Number,
      default: 1,
      min: 0.1,
    },
    riceScore: {
      type: Number,
      default: 0,
    },
    estado: {
      type: String,
      enum: ESTADOS_RICE,
      default: "Backlog",
    },
    sprint: {
      type: String,
      default: "",
      trim: true,
    },
    vetoGerencia: {
      type: Boolean,
      default: false,
    },
    notasSeguimiento: {
      type: String,
      default: "",
      trim: true,
    },
    historial: {
      type: [HistoryEntrySchema],
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
    },
  }
);

RiceItemSchema.index({ createdAt: -1 });
RiceItemSchema.index({ updatedAt: -1 });
RiceItemSchema.index({ estado: 1 });
RiceItemSchema.index({ carril: 1 });
RiceItemSchema.index({ tipoActividad: 1 });
RiceItemSchema.index({ deletedAt: 1 });
RiceItemSchema.index({ "historial.fecha": -1 });

RiceItemSchema.index({
  titulo: "text",
  descripcion: "text",
  solicitadoPor: "text",
  areaSolicitante: "text",
});

const RiceItem = mongoose.model("RiceItem", RiceItemSchema);

export default RiceItem;