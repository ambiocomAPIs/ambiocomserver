import mongoose from "mongoose";

const conductorSchema = new mongoose.Schema(
  {
    nombres: {
      type: String,
      required: true,
      trim: true,
    },
    apellidos: {
      type: String,
      required: true,
      trim: true,
    },
    placaVehiculo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    empresa: {
      type: String,
      required: true,
      trim: true,
    },
    carroseria: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Conductor", conductorSchema);
