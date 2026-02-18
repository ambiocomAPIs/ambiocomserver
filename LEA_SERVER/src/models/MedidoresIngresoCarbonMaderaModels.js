import mongoose from "mongoose";

const MedidoresIngresoCarbonMadera = new mongoose.Schema(
  {
    fecha: {
      type: String, // DD-MM-YYYY
      required: true,
    },

    hora: {
      type: String, // ej: "06:30"
      required: true,
    },

    responsable: {
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
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },

//     {
//   "_id": "65a1c...",
//   "fecha": "10-12-2025",
//   "hora": "07:00",
//   "responsable": "Juan Pérez",
//   "observaciones": "Lectura normal, sin fugas",
//   "lecturas": {
//     "Energia_CON": 1250,
//     "OTRO": 830,
//   },
//   "createdAt": "2025-12-10T12:00:00Z"
// }

  },
  {
    timestamps: true, // createdAt / updatedAt
    versionKey: false,
  }
);

export default mongoose.model("MedidoresIngresoCarbonMadera", MedidoresIngresoCarbonMadera);
