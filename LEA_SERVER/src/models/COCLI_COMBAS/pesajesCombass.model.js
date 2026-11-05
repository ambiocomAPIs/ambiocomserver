
import mongoose from "mongoose";

const PesajesCombassSchema = new mongoose.Schema(
  {
    consecutivo: String,
    movimiento: String,
    fechaIngreso: String,
    horaIngreso: String,
    fechaSalida: String,
    horaSalida: String,
    placa: String,
    remolque: String,
    conductor: String,
    documentoConductor: String,
    transportadora: String,
    clienteProveedor: String,
    nitDocumento: String,
    remisionFactura: String,
    producto: String,
    unidad: String,
    puerto: String,
    origen: String,
    destino: String,
    observaciones: String,
    pesoEntrada: Number,
    pesoSalida: Number,
    pesoNeto: Number,
    operador: String,
    fechaProgramada: String,
    horaProgramada: String,
    cantidadProgramada: Number,
    fechaEstimadaEntrega: String,
    cocliDespachoId: String,
    cocliRecepcionId: String,
    cocliCombustibleId: String,
  },
  {
    timestamps: true,
    versionKey: false,
    strict: false,
  }
);

const PesajesCombass =
  mongoose.models.Cocli_combass ||
  mongoose.model(
    "Cocli_combass",
    PesajesCombassSchema,
    "cocli_combasses"
  );

export default PesajesCombass;
