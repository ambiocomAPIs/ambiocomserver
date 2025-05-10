import mongoose from 'mongoose';

const tanquesJornalerosSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacidad: {
    type: Number,
    required: true, // en litros
    min: 0
  },
  nivel: {
    type: Number,
    required: true, // nivel actual en litros
    min: 0
  },
  volumen: {
    type: Number,
    required: true, // volumen medido, si aplica
    min: 0
  }
}, {
  timestamps: true // crea createdAt y updatedAt
});

tanquesJornalerosSchema.index({ nombre: 1 });

const TanquesJornaleros = mongoose.model('TanquesJornaleros', tanquesJornalerosSchema);

export default TanquesJornaleros;
