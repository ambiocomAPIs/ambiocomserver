import mongoose from "mongoose";

const ClientesLogisticaSchema = new mongoose.Schema(
  {
    comercial: { type: String, required: true, trim: true },
    cliente: { type: String, required: true, trim: true },
    tipoOH: { type: String, required: true, trim: true },
    incoterm: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("clienteslogistica", ClientesLogisticaSchema);