import mongoose from "mongoose";

const GraficaInsumosvsAlcoholesModelSchema = new mongoose.Schema(
  {
    produccionActual: { type: Number, required: true },
    produccionAnterior: { type: Number, required: true },
    mesDeCierre: { type: String, required: true },
    mesComparar: { type: String, required: true },
    tituloGrafico: { type: String, default: "Gráfico Comparativo" },
    serieActual: { type: String, default: "Serie Actual" },
    serieAnterior: { type: String, default: "Serie Anterior" },
    fechaRegistro: { type: String, default: "00-00-00" },
    CreatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("GraficaInsumosKg/OH", GraficaInsumosvsAlcoholesModelSchema);
