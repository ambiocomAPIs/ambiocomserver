import mongoose from "mongoose";

// este modelo crea columnas en la tabla de medidores de aguas

const ColumnaMedidorEnergiaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // ej: Energia_Con
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
      // ej: Energia_Con
    },

    unidad: {
      type: String,
      default: "KWatts",
    },

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("ColumnaMedidorEnergia", ColumnaMedidorEnergiaSchema);
