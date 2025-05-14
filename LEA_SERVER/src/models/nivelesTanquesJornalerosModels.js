import mongoose from 'mongoose';

// Definir el esquema con 18 campos
const NivelDiarioTanquesJornalerosSchema = new mongoose.Schema({
  NombreTanque: { type: String },
  NivelTanque: { type: Number }, 
  Responsable: { type: String },
  Observaciones: { type: String },
  FechaRegistro: { type: String, default: null },  // Agregar el campo FechaRegistro
}, { timestamps: true });  // Este campo agrega createdAt y updatedAt automáticamente

// Crear el modelo
const NivelDiarioJornalerosLogistica = mongoose.model('NivelDiarioJornalerosLogistica', NivelDiarioTanquesJornalerosSchema);

export default NivelDiarioJornalerosLogistica;
