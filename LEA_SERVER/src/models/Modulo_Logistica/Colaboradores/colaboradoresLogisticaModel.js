import mongoose from "mongoose";

const ColaboradoresLogisticaSchema = new mongoose.Schema(
 {
    nombres: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ColaboradoresLogistica", ColaboradoresLogisticaSchema);