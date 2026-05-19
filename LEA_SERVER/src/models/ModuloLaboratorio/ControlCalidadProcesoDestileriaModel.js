import mongoose from "mongoose";

const ControlCalidadProcesoDestileriaSchema = new mongoose.Schema(
  {
    formato: {
      type: String,
      default: "4-LAB-032",
    },
    version: {
      type: String,
      default: "3",
    },
    pagina: {
      type: String,
      default: "3-3",
    },
    tabla: {
      type: String,
      default: "Control de calidad en proceso / Extracciones en la destilería",
    },
    fechaRegistro: {
      type: String,
      required: true,
      trim: true,
    },
    fechaGuardado: {
      type: String,
      default: () => new Date().toISOString(),
    },
    observacionesGenerales: {
      type: String,
      default: "",
    },
    encabezado: {
      fecha: {
        type: String,
        default: "",
      },
      tanque: {
        type: String,
        default: "",
      },
    },
    controlCalidad: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    extracciones: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ControlCalidadProcesoDestileria",
  ControlCalidadProcesoDestileriaSchema
);