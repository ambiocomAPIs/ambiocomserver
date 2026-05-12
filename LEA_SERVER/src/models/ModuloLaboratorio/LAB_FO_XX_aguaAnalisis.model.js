import mongoose from "mongoose";

const AguaAnalisisSchema = new mongoose.Schema(
  {
    formato: {
      type: String,
      default: "LAB-FO-027",
    },
    version: {
      type: String,
      default: "15",
    },
    pagina: {
      type: String,
      default: "1-1",
    },
    tabla: {
      type: String,
      default: "Análisis de agua",
    },

    fechaRegistro: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    fechaRegistroISO: {
      type: Date,
      required: true,
      index: true,
    },

    data: {
      type: Array,
      required: true,
      default: [],
    },

    resumenAnalisis: {
      datosAnalizados: {
        type: Number,
        default: 0,
      },
      cumplen: {
        type: Number,
        default: 0,
      },
      noCumplen: {
        type: Number,
        default: 0,
      },
      rate: {
        type: Number,
        default: 0,
      },
      rateTexto: {
        type: String,
        default: "0.00%",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AnalisisAguaParametros", AguaAnalisisSchema);