import mongoose from 'mongoose';

// Definir el esquema con 18 campos
const TanquesSchema = new mongoose.Schema({
  NombreTanque: { type: String },
  Disposicion: { type: String },
  Factor: { type: String },
  VolumenTotal: { type: String },
}, { timestamps: true });  // Este campo agrega createdAt y updatedAt automáticamente

const Tanques = mongoose.model('Tanques', TanquesSchema);

export default Tanques;