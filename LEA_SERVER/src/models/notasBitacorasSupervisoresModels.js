import mongoose from "mongoose";

const NoteBitacoraSupervisoresSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: String, required: true },
  turno: { type: String, required: true },
  supervisor: { type: String, required: true }, 
  module: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }, 
});

const NotasBitacoraSupervisores = mongoose.model("NotasBitacoraSupervisoresSchema", NoteBitacoraSupervisoresSchema);
export default NotasBitacoraSupervisores;