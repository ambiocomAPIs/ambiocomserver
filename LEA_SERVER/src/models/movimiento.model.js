import mongoose from 'mongoose';

const movimientoSchema = new mongoose.Schema({
  tipoOperacion: { type: String, required: true },
  producto: { type: String, required: true },
  lote: { type: String, required: true },
  inventario: { type: Number, required: true },
  unidad: { type: String, required: true },
  costoUnitario: { type: Number, required: true },
  proveedor: { type: String },
  responsable: { type: String, required: true },
  area: { type: String, required: true },
  consumoReportado: { type: Number, required: true },
  CostoMovimiento: { type: Number },
  fechaMovimiento: { type: String, required: true },
  ObservacionesAdicionales: { type: String, default :"Sin observaciones" },
  SAP: { type: Number },
  cantidadIngreso: { type: String }
}, { timestamps: true });

// Asegurarse de que el CostoMovimiento siempre sea positivo (valor absoluto)
movimientoSchema.pre('save', function(next) {
  // Calcular CostoMovimiento como el valor absoluto de la multiplicación de consumoReportado y costoUnitario
  this.CostoMovimiento = Math.abs(this.consumoReportado * this.costoUnitario);
  next(); // Continuar con la operación de guardar el documento
});

export default mongoose.model('Movimiento', movimientoSchema);
