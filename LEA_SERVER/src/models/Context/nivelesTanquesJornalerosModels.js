import mongoose from "mongoose";

const NivelDiarioTanquesJornalerosSchema = new mongoose.Schema(
  {
    NombreTanque: { type: String },
    NivelTanque: { type: Number },
    Responsable: { type: String },
    Disposicion: { type: String },
    Factor: { type: String },

    GradoAlcoholico: {
      type: Number,
      default: null,
      set: (valor) => {
        if (
          valor === "" ||
          valor === null ||
          valor === undefined
        ) {
          return null;
        }

        const valorNormalizado = String(valor)
          .trim()
          .replace(",", ".");

        const numero = Number(valorNormalizado);

        return Number.isFinite(numero) ? numero : null;
      },
    },

    Observaciones: { type: String },
    FechaRegistro: { type: String, default: null },
  },
  { timestamps: true }
);

const NivelDiarioJornalerosLogistica = mongoose.model(
  "NivelDiarioJornalerosLogistica",
  NivelDiarioTanquesJornalerosSchema
);

export default NivelDiarioJornalerosLogistica;