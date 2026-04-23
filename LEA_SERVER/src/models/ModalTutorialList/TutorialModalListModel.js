import mongoose from "mongoose";

const tutorialModalListSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },
    link: {
      type: String,
      required: [true, "El link es obligatorio"],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
    },
    modulo: {
      type: String,
      required: [true, "El módulo es obligatorio"],
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("TutorialModalList", tutorialModalListSchema);