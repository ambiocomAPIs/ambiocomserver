
import mongoose from "mongoose";

const PostulacionLaboralWebFlowSchema = new mongoose.Schema(
  {
    webflowSubmissionId: {
      type: String,
      required: true,
      unique: true,
    },

    webflowSiteId: String,
    webflowFormId: String,

    vacante: {
      titulo: {
        type: String,
        trim: true,
      },

      ciudad: {
        type: String,
        trim: true,
      },

      modalidad: {
        type: String,
        trim: true,
      },

      contrato: {
        type: String,
        trim: true,
      },

      fechaPublicacion: {
        type: Date,
        default: null,
      },

      fechaCierre: {
        type: Date,
        default: null,
      },

      activa: {
        type: Boolean,
        default: null,
      },
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
    collection: "postulacioneslaboraleswebflow",
  }
);

export default mongoose.model(
  "PostulacionLaboralWebFlow",
  PostulacionLaboralWebFlowSchema
);
