import mongoose from "mongoose";

// este modelo crea columnas en la tabla de medidores de aguas

const ColumnaMedidorAguaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // ej: torre, pozo1, caldera
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
      // ej: Torre de Enfriamiento
    },

    unidad: {
      type: String,
      default: "m³",
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

export default mongoose.model("ColumnaMedidorAgua", ColumnaMedidorAguaSchema);
