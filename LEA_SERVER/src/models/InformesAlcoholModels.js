import mongoose from "mongoose";

const TanqueSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // TK-xxx o bodega-xxx o mezcla
    NombreTanque: String,
    Origen: String,
    NivelTanque: Number,
    Factor: Number,
    VolumenCalculado: Number,
    tipo: { type: String, enum: ["bodega"], default: null },
    mezcla: Boolean,
    porcentaje: Number,
    zonaOrigen: String,
  },
  { _id: false }
);

const ZonaSchema = new mongoose.Schema(
  {
    id: String,
    nombre: String,
    tanques: [TanqueSchema],
    costoLitro: Number,
    volumenSAP: Number,
    comentario: String,
  },
  { _id: false }
);

const InformeAlcoholSchema = new mongoose.Schema(
  {
    fecha: { type: String, required: true, index: true },
    zonas: [ZonaSchema],
    bodegas: { type: Array, default: [] }, // por si luego lo quieres aparte
  },
  { timestamps: true }
);

export default mongoose.model("InformeAlcoholHistorico", InformeAlcoholSchema);
