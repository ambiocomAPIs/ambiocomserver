import mongoose from "mongoose";

const DespachoAlcoholesLogisticaSchema = new mongoose.Schema(
  {
    fecha: {
      type: String, // DD-MM-YYYY
      required: true,
    },

    responsable: {
      type: String,
      required: true,
      trim: true,
    },

    observaciones: {
      type: String,
      trim: true,
    },

    //columnas dinámicas
    lecturas: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
    versionKey: false,
  }
);

export default mongoose.model("DespachoAlcoholesLogistica", DespachoAlcoholesLogisticaSchema);
