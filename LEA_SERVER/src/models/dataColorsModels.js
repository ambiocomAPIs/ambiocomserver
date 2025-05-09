import mongoose from 'mongoose';

// Definir el esquema con 18 campos
const dataColorsSchema = new mongoose.Schema({
  Reactivo: { type: String },
  proveedor: { type: String },
  Codigo: { type: String }, // Cambié a String, ya que parece más apropiado
  Lote: { type: String },  // Correcto para establecer fecha por defecto
  fechaVencimiento: { type: String },  // Cambié a Date, ya que parece ser una fecha
  CAS: { type: String },
  Color: { type: String },
  Accion: {type: String},
}, { timestamps: true });  // Este campo agrega createdAt y updatedAt automáticamente

// Crear los índices en los campos más utilizados
dataColorsSchema.index({ fechaVencimiento: 1 });
dataColorsSchema.index({ mesesRestantes: 1 });

// Crear el modelo
const DataColors = mongoose.model('DataColors', dataColorsSchema);

export default DataColors;
