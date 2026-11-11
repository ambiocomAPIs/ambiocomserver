
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

      edad: {
        type: Number,
        min: 0,
        max: 120,
        default: null,
      },

      municipioResidencia: {
        type: String,
        trim: true,
        default: "",
      },

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

    fechaPrimeraVisualizacion: {
      type: Date,
      default: null,
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
