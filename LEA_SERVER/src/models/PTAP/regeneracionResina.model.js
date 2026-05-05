import mongoose from "mongoose";

const RegeneracionResinaSchema = new mongoose.Schema(
    {
        fecha: {
            type: String,
            required: true,
            match: /^\d{4}-\d{2}-\d{2}$/,
            index: true,
        },

        responsable: {
            type: String,
            required: true,
            trim: true,
        },

        // TREN CARBÓN ACTIVADO
        carbonActivado: {
            ph: { type: String, default: "" },
            conductividad: { type: String, default: "" },
            dureza: { type: String, default: "" },
            silice: { type: String, default: "" },
            tds: { type: String, default: "" },
            alcalinidad: { type: String, default: "" },
        },

        // TREN CATION
        cation: {
            ph: { type: String, default: "", required: true },
            dureza: { type: String, default: "", required: true },
            acidoSulfurico: { type: String, default: "", required: true },
        },

        // TREN ANION
        anion: {
            ph: { type: String, default: "" },
            conductividad: { type: String, default: "", required: true },
            silice: { type: String, default: "" },
            tds: { type: String, default: "" },
            alcalinidad: { type: String, default: "" },
            consumoSoda: { type: String, default: "", required: true },
        },

        // ESTADOS
        estadoCation: { type: String, default: "No", required: true },
        estadoAnion: { type: String, default: "No", required: true },

        reporteCicoq: { type: String, default: "No", required: true },
        correoNotificado: { type: String, default: "No", required: true },

        observaciones: {
            type: String,
            default: "Ninguna",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("RegeneracionResinaData", RegeneracionResinaSchema);