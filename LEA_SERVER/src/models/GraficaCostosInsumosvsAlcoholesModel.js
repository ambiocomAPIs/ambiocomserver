import mongoose from "mongoose";

const GraficacostoInsumosvsAlcoholesModelSchema = new mongoose.Schema(
  {
    produccionActual: { type: Number, required: true },
    produccionAnterior: { type: Number, required: true },
    mesDeCierre: { type: [String], required: true },
    mesComparar: { type: [String], required: true },
    tituloGrafico: { type: String, default: "Gráfico Comparativo" },
    serieActual: { type: String, default: "Serie Actual" },
    serieAnterior: { type: String, default: "Serie Anterior" },
    fechaRegistro: { type: String, default: "00-00-00" },

    // 🔹 Sumatorias Mes Seleccionado
    consumoCaldera: { type: Number, default: 0 },
    consumoAguas: { type: Number, default: 0 },
    consumoTorre: { type: Number, default: 0 },

    // 🔹 Sumatorias Mes Comparar
    consumoCalderaComp: { type: Number, default: 0 },
    consumoAguasComp: { type: Number, default: 0 },
    consumoTorreComp: { type: Number, default: 0 },

    CreatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model(
  "GraficaInsumosprecioporOH",
  GraficacostoInsumosvsAlcoholesModelSchema
);
