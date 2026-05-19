import mongoose from "mongoose";

const TrazabilidadLoteProduccionLaboratorioSchema = new mongoose.Schema(
    {
        observacionesGenerales: {
            type: String,
            default: "",
        },
        formato: {
            type: String,
            default: "4-LAB-032",
        },
        version: {
            type: String,
            default: "3",
        },
        pagina: {
            type: String,
            default: "3-3",
        },
        tabla: {
            type: String,
            default: "Trazabilidad de lote de producción",
        },
        fechaRegistro: {
            type: String,
            required: true,
            trim: true,
        },
        fechaGuardado: {
            type: String,
            default: () => new Date().toISOString(),
        },

        encabezado: {
            fecha: {
                type: String,
                default: "",
            },
            lote: {
                type: String,
                default: "",
            },
            tipoAlcohol: {
                type: String,
                default: "",
            },
            tanque: {
                type: String,
                default: "",
            },
            fechaInicioLlenado: {
                type: String,
                default: "",
            },
            horaInicioLlenado: {
                type: String,
                default: "",
            },
            fechaFinalLlenado: {
                type: String,
                default: "",
            },
            horaFinalLlenado: {
                type: String,
                default: "",
            },
        },

        materiaPrima: {
            codigoInterno: {
                type: String,
                default: "",
            },
            fechaRecibo: {
                type: String,
                default: "",
            },
            origen: {
                type: String,
                default: "",
            },
            proveedor: {
                type: String,
                default: "",
            },
            tipoAlcohol: {
                type: String,
                default: "",
            },
            gradoAlcoholico: {
                type: String,
                default: "",
            },
            tanqueOrigen: {
                type: String,
                default: "",
            },
            volumenAlimentado: {
                type: String,
                default: "",
            },
        },

        analisisFisicoquimicoAlimentacion: {
            type: Array,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "TrazabilidadLoteProduccionLaboratorio",
    TrazabilidadLoteProduccionLaboratorioSchema
);