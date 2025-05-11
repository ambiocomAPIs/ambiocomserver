import mongoose from 'mongoose';

const OperacionesDeTanquesSchema = new mongoose.Schema({
  tipoDeMovimiento: {
    type: String,
    required: true,
  },
  tanqueOrigen: {
    type: String,
  },
  tanqueDestino: {
    type: String,
  },
  cantidad: {
    type: Number,
    required: true,
    min: 0
  },
  responsable: {
    type: String,
    required: true,
  },
  cliente: {
    type: String,
  },
  detalleFactura: {
    type: String,
  },
  observaciones: {
    type: String,
    required: true, 
  }
}, {
  timestamps: true 
});

// OperacionesDeTanquesSchema.index({ nombre: 1 });

const ReporteOperacionesDeTanques = mongoose.model('ReporteOperacionDeTanques', OperacionesDeTanquesSchema);

export default ReporteOperacionesDeTanques;
