import mongoose from 'mongoose';

const ProductoSchema = new mongoose.Schema({
  nombre: String,
  ValorUnitario: Number,
  Inventario: Number,
  unidad: String,
  ConsumoMensual: Number,
  GastoMensual: Number,
  proveedor: String,
  lote: String,
  tipo: String,
  area: String,
  fechaIngreso: String,
  fechaVencimiento: String,
  fechaActualizacionInformacion: String,
  cantidadIngreso: String,
  manipulacion: { type: String, default: 'Sin especificar' },
  almacenamiento: String,
  certificadoAnalisis: Boolean,
  responsable: String,
  observaciones: { type: String, default: 'Ninguna' },
  SAP: Number,
  ConsumoAcumuladoAnual: Number,
  GastoAcumulado: Number,
  mesesRestantes: String,
  estado: String,
  notificado: Boolean
}, { _id: false }); // usamos _id: false para no duplicar IDs dentro del array

const CierreMesSchema = new mongoose.Schema({
  MesDeCierre: { type: String },
  FechaDeCierre: { type: Date },
  dataMes: [ProductoSchema]
}, { timestamps: true });

const CierreMes = mongoose.model('CierreMes', CierreMesSchema);

export default CierreMes;
