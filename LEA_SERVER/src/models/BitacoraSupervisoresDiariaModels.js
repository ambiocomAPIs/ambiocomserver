import mongoose from "mongoose";

const BitacoraSupervisoresSchema = new mongoose.Schema({
  fecha: String,
  turno: String,
  supervisor: String,
  op_destileria: String,
  op_caldera: String,
  op_aguas: String,
  aux_caldera: String,
  analista1: String,
  analista2: String,
}, { timestamps: true });

// Índice compuesto único
BitacoraSupervisoresSchema.index({ fecha: 1, turno: 1 }, { unique: true });

export default mongoose.model("BitacoraSupervisores", BitacoraSupervisoresSchema);