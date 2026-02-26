import mongoose from "mongoose";

const TransportadoraLogisticaSchema = new mongoose.Schema(
  {
    nombreTransportadora: { type: String, required: true, trim: true },
    locacion: { type: String, required: false, trim: true },
    contactoTelefonico: { type: String, trim: true, default: "" },
    emailContacto: { type: String, trim: true, lowercase: true, default: "" },
  },
  { timestamps: true }
);

// opcional: evitar duplicados por nombre
TransportadoraLogisticaSchema.index({ nombreTransportadora: 1 }, { unique: true });

const Empresa = mongoose.model("transportadoraLogisticaDB", TransportadoraLogisticaSchema);
export default Empresa;