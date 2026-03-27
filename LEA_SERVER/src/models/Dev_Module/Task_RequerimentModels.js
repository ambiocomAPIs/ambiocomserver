import mongoose from "mongoose";

const TaskRequestSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["Tarea", "Hallazgo", "Requerimiento", "Seguridad"],
      default: "Tarea",
      required: true,
      trim: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    completado: {
      type: Boolean,
      default: false,
    },
    prioridad: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    creadoEn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const TaskRequestDev = mongoose.model("TaskRequest", TaskRequestSchema);

export default TaskRequestDev;