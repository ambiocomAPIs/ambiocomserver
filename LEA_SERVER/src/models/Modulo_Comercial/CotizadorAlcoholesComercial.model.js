import mongoose from "mongoose";

const { Schema } = mongoose;

const RutaFleteSchema = new Schema(
  {
    ciudadOrigen: {
      type: String,
      trim: true,
      default: "",
    },
    ciudadDestino: {
      type: String,
      trim: true,
      default: "",
    },
    tipoVehiculo: {
      type: String,
      trim: true,
      default: "",
    },
    especificacion: {
      type: String,
      trim: true,
      default: "",
    },
    cantidadLitros: {
      type: Number,
      default: 0,
    },
    fletePromedio: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const RecipienteDataSchema = new Schema(
  {
    tipo: {
      type: String,
      trim: true,
      default: "",
    },
    cant: {
      type: Number,
      default: 0,
    },
    amort: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const HistorialEstadoSchema = new Schema(
  {
    estadoAnterior: {
      type: String,
      trim: true,
      default: "",
    },
    estadoNuevo: {
      type: String,
      trim: true,
      required: true,
    },
    usuario: {
      type: String,
      trim: true,
      default: "",
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CotizacionAlcoholComercialSchema = new Schema(
  {
    fecha: {
      type: Date,
      default: Date.now,
      index: true,
    },

    comercial: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["emily", "vanessa", "marcelo"],
      index: true,
    },

    cliente: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    estado: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["enviada", "negociacion", "ganada", "perdida"],
      default: "enviada",
      index: true,
    },

    producto: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    sector: {
      type: String,
      trim: true,
      default: "",
    },

    origen: {
      type: String,
      trim: true,
      default: "",
    },

    ciudad: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    rutaFleteId: {
      type: String,
      trim: true,
      default: "",
    },

    rutaFlete: {
      type: RutaFleteSchema,
      default: null,
    },

    tipo: {
      type: String,
      trim: true,
      default: "",
    },

    volPed: {
      type: Number,
      default: 0,
    },

    volMen: {
      type: Number,
      default: 0,
    },

    trm: {
      type: Number,
      default: 0,
    },

    pv: {
      type: Number,
      default: 0,
    },

    pe: {
      type: Number,
      default: 0,
    },

    peCOP: {
      type: Number,
      default: 0,
    },

    margenObjetivo: {
      type: Number,
      default: 0,
    },

    costoTotalUSD: {
      type: Number,
      default: 0,
    },

    fleteCOP: {
      type: Number,
      default: 0,
    },

    fleteUSD: {
      type: Number,
      default: 0,
    },

    recipUSD: {
      type: Number,
      default: 0,
    },

    util: {
      type: Number,
      default: 0,
    },

    margen: {
      type: Number,
      default: 0,
    },

    recipData: {
      type: RecipienteDataSchema,
      default: null,
    },

    creadoPor: {
      type: String,
      trim: true,
      default: "",
    },

    actualizadoPor: {
      type: String,
      trim: true,
      default: "",
    },

    historialEstados: {
      type: [HistorialEstadoSchema],
      default: [],
    },

    activo: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

CotizacionAlcoholComercialSchema.index({
  cliente: "text",
  producto: "text",
  ciudad: "text",
  comercial: "text",
});

export default mongoose.model("CotizacionAlcoholComercial", CotizacionAlcoholComercialSchema);