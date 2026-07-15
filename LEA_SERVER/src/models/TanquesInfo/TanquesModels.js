import mongoose from "mongoose";

// Definir el esquema
const TanquesSchema = new mongoose.Schema(
  {
    NombreTanque: { type: String },
    Disposicion: { type: String },
    Factor: { type: String },
    VolumenTotal: { type: String },

    GradoAlcoholico: {
      type: Number,
      set: (valor) => {
        if (
          valor === "" ||
          valor === null ||
          valor === undefined
        ) {
          return undefined;
        }

        // Permite recibir 96,2 o 96.2
        const valorNormalizado = String(valor)
          .trim()
          .replace(",", ".");

        return Number(valorNormalizado);
      },
    },
  },
  { timestamps: true }
);

const Tanques = mongoose.model("Tanques", TanquesSchema);

export default Tanques;