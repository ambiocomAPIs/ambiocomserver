import mongoose from "mongoose";

const MedidoresAgua = new mongoose.Schema(
  {
    fecha: {
      type: String, // DD-MM-YYYY
      required: true,
    },

    hora: {
      type: String, // ej: "06:30"
      required: true,
    },

    operador: {
      type: String,
      required: true,
      trim: true,
    },

    observaciones: {
      type: String,
      trim: true,
    },

    //columnas dinámicas
    lecturas: {
      type: Map,
      of: Number,
      required: true,
    },

//     {
//   "_id": "65a1c...",
//   "fecha": "10-12-2025",
//   "hora": "07:00",
//   "operador": "Juan Pérez",
//   "observaciones": "Lectura normal, sin fugas",
//   "lecturas": {
//     "torre": 1250,
//     "caldera": 830,
//     "potable": 420,
//     "pozo1": 980,
//     "pozo2": 760,
//     "vinazas": 310,
//     "praxair": 150
//   },
//   "createdAt": "2025-12-10T12:00:00Z"
// }

  },
  {
    timestamps: true, // createdAt / updatedAt
    versionKey: false,
  }
);

export default mongoose.model("MedidoresAgua", MedidoresAgua);
