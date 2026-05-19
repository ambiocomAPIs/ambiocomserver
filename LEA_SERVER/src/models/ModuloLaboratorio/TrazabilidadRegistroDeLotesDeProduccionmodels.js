import mongoose from "mongoose";

const TrazabilidadRegistroLoteProduccionSchema = new mongoose.Schema(
  {
    formato: { type: String, default: "4-LAB-032" },
    version: { type: String, default: "3" },
    tabla: {
      type: String,
      default: "Trazabilidad de lote de producción",
    },

    fechaRegistro: {
      type: String,
      required: true,
      trim: true,
    },

    tipoPestana: {
      type: String,
      required: true,
      enum: ["intermedios", "terminado", "despachos"],
    },

    comentario: {
      type: String,
      default: "",
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    fechaGuardado: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "TrazabilidadRegistroLoteProduccion",
  TrazabilidadRegistroLoteProduccionSchema
);