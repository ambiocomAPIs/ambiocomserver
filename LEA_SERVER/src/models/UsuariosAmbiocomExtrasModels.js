// models/Usuario.js
import mongoose from 'mongoose';

const UsuariosAmbiocomExtrasModelsSchema = new mongoose.Schema({
  cedula: { type: String, required: true },
  nombre: { type: String, required: true },
  grupoAsignado: { type: String, required: true },
  mes: { type: Number, required: true },
  anio: { type: Number, required: true },
  tipoDocumento: { type: String },
  fechaNacimiento: { type: Date },
  cargo: { type: String },
  HED: { type: Number, default: 0 },
  HEN: { type: Number, default: 0 },
  HEFD: { type: Number, default: 0 },
  HEFN: { type: Number, default: 0 },
  HFD: { type: Number, default: 0 },
  HFN: { type: Number, default: 0 },
  RN: { type: Number, default: 0 },
});

export default mongoose.model('UsuariosHorasExtras', UsuariosAmbiocomExtrasModelsSchema);
