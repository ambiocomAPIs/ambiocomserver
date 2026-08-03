import mongoose from "mongoose";

const NiveltanquesscadaSchema = new mongoose.Schema(
  {
    fecha: {
      type: String,
      required: true,
    },

    hora: {
      type: String,
      required: true,
    },

    LT650: {
      type: Number,
      default: null,
    },

    LT801A: {
      type: Number,
      default: null,
    },

    LT801B: {
      type: Number,
      default: null,
    },
    
    LT102B: {
      type: Number,
      default: null,
    },

    LT102A: {
      type: Number,
      default: null,
    },


    LT402A: {
      type: Number,
      default: null,
    },

    LT402B: {
      type: Number,
      default: null,
    },

    LT805: {
      type: Number,
      default: null,
    },

    LT806: {
      type: Number,
      default: null,
    },

    LT807: {
      type: Number,
      default: null,
    },

    LT808: {
      type: Number,
      default: null,
    },

    LT300A: {
      type: Number,
      default: null,
    },

    origen: {
      type: String,
      default: "AVEVA_EDGE",
    },
  },
  {
    timestamps: true,
  }
);

const Niveltanquesscada = mongoose.model(
  "Niveltanquesscada",
  NiveltanquesscadaSchema
);

export default Niveltanquesscada;