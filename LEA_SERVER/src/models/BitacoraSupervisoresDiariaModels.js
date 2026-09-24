import mongoose from "mongoose";

// const BitacoraSupervisoresSchema = new mongoose.Schema({
//   fecha: String,
//   turno: String,
//   supervisor: String,
//   op_destileria: String,
//   op_caldera: String,
//   op_aguas: String,
//   aux_caldera: String,
//   analista1: String,
//   analista2: String,
// }, { timestamps: true });

// // Índice compuesto único
// BitacoraSupervisoresSchema.index({ fecha: 1, turno: 1 }, { unique: true });

// export default mongoose.model("BitacoraSupervisores", BitacoraSupervisoresSchema);

// import mongoose from "mongoose";

const BitacoraSupervisoresSchema = new mongoose.Schema(
  {
    fecha: String,

    turno: String,

    supervisor: String,

    op_destileria: String,

    op_caldera: String,

    op_aguas: String,

    aux_caldera: String,

    analista1: String,

    analista2: String,

    grupoProduccion: {
      type: Number,
      enum: [1, 2],
      default: null,
    },

    metaProduccionDia: {
      type: Number,
      default: 0,
      min: 0,
    },

    produccionTurno: {
      type: Number,
      default: 0,
      min: 0,
    },

    metaProduccionTurno: {
      type: Number,
      default: 0,
      min: 0,
    },

    produccionAcumuladaDia: {
      type: Number,
      default: 0,
      min: 0,
    },

    porcentajeCumplimientoTurno: {
      type: Number,
      default: 0,
      min: 0,
    },

    porcentajeCumplimientoDia: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Un solo registro por fecha y turno
BitacoraSupervisoresSchema.index(
  {
    fecha: 1,
    turno: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "BitacoraSupervisores",
  BitacoraSupervisoresSchema
);