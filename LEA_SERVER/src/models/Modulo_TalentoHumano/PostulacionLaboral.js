
import mongoose from "mongoose";

const PostulacionLaboralSchema = new mongoose.Schema(
  {
    webflowSubmissionId: {
      type: String,
      required: true,
      unique: true,
    },

    webflowSiteId: String,
    webflowFormId: String,

    vacante: {
      titulo: String,
      ciudad: String,
      modalidad: String,
      contrato: String,
    },

    aspirante: {
      nombreCompleto: String,
      correoPersonal: String,
      contactoPersonal: String,
      expectativasComentarios: String,
    },

    hojaVida: {
      urlWebflow: String,
      estado: {
        type: String,
        default: "PENDIENTE_VERIFICACION",
      },
    },

    fechaPostulacion: Date,

    estado: {
      type: String,
      default: "RECIBIDA",
    },
  },
  {
    timestamps: true,
    collection: "postulacioneslaborales",
  }
);

export default mongoose.model(
  "PostulacionLaboral",
  PostulacionLaboralSchema
);
