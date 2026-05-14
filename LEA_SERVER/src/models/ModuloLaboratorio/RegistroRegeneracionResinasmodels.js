import mongoose from "mongoose";

const AnalisisAguaRegistroRegeneracionResinasAguaSchema = new mongoose.Schema(
  {
    fechaRegistro: {
      type: String,
      required: true,
      index: true,
    },

    rows: {
      type: Array,
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const AnalisisAgua = mongoose.model( "AnalisisAguaRegistroRegeneracionResinas", AnalisisAguaRegistroRegeneracionResinasAguaSchema);

export default AnalisisAgua;
