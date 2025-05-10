import mongoose from 'mongoose';

// Definir el esquema con 18 campos
const dataSchema = new mongoose.Schema({
  nombre: { type: String }, // Cambié a String, ya que parece más apropiado
  ValorUnitario: { type: Number }, 
  Inventario: { type: Number },
  unidad: { type: String },
  ConsumoMensual: { type: Number }, 
  GastoMensual: { type: Number }, 
  proveedor: { type: String },
  lote: { type: String },  // Correcto para establecer fecha por defecto
  tipo: { type: String },
  area: { type: String },
  fechaIngreso: { type: String },  // Cambié a Date si debe ser una fecha
  fechaVencimiento: { type: String },  // Cambié a Date, ya que parece ser una fecha
  fechaActualizacionInformacion: { type: String },
  cantidadIngreso: { type: String},  // Cambié a Number si representa una cantidad
  manipulacion: { type: String, default: "Sin especificar" },
  almacenamiento: { type: String },
  certificadoAnalisis: { type: Boolean },
  responsable: { type: String },  // Cambié a String si es un nombre o identificador
  observaciones: { type: String, default: "Ninguna" },
  InventarioCritico: { type: Number, default: 0 }, 
  SAP: { type: Number }, 
  ConsumoAcumuladoAnual: { type: Number }, 
  GastoAcumulado: { type: Number }, 
  mesesRestantes: { type: String },
  estado: {type: String},
  notificado: { type: Boolean, default: false }
}, { timestamps: true });  // Este campo agrega createdAt y updatedAt automáticamente

// Crear los índices en los campos más utilizados
dataSchema.index({ fechaVencimiento: 1 });
dataSchema.index({ mesesRestantes: 1 });

// Crear el modelo
const Data = mongoose.model('Data', dataSchema);

export default Data;
