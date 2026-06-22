import mongoose from "mongoose";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/;

const ProgramacionDespachoSchema = new mongoose.Schema(
  {
    fecha: {
      type: String,
      required: [true, "La fecha es obligatoria."],
      trim: true,
      match: [ISO_DATE_REGEX, 'La fecha debe tener formato "YYYY-MM-DD".'],
    },

    fechaEstimadaEntrega: {
      type: String,
      required: [true, "La fecha estimada de entrega es obligatoria."],
      trim: true,
      default: "NA",
      validate: {
        validator: function (value) {
          const v = String(value ?? "").trim().toUpperCase();

          if (v === "NA") return true;

          return ISO_DATETIME_REGEX.test(v);
        },
        message:
          'La fecha estimada de entrega debe ser "NA" o tener formato "YYYY-MM-DD HH:mm".',
      },
    },

    horaProgramada: {
      type: String,
      trim: true,
      default: "",
    },

    placa: {
      type: String,
      trim: true,
      default: "",
    },

    trailer: {
      type: String,
      trim: true,
      default: "",
    },

    conductor: {
      type: String,
      trim: true,
      default: "",
    },

    transportadora: {
      type: String,
      trim: true,
      default: "",
    },

    cliente: {
      type: String,
      required: [true, "El cliente es obligatorio."],
      trim: true,
    },

    destino: {
      type: String,
      required: [true, "El destino es obligatorio."],
      trim: true,
    },

    producto: {
      type: String,
      required: [true, "El producto es obligatorio."],
      trim: true,
    },

    cantidad: {
      type: Number,
      required: [true, "La cantidad es obligatoria."],
      min: [1, "La cantidad debe ser mayor a 0."],
    },

    cumplido: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices útiles
ProgramacionDespachoSchema.index({ fecha: 1 });
ProgramacionDespachoSchema.index({ fechaEstimadaEntrega: 1 });
ProgramacionDespachoSchema.index({ cliente: 1 });
ProgramacionDespachoSchema.index({ producto: 1 });
ProgramacionDespachoSchema.index({ transportadora: 1 });
ProgramacionDespachoSchema.index({ destino: 1 });

// Normalización adicional
ProgramacionDespachoSchema.pre("save", function (next) {
  const normalize = (v) =>
    String(v ?? "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  this.fecha = normalize(this.fecha);

  this.fechaEstimadaEntrega =
    normalize(this.fechaEstimadaEntrega).toUpperCase() || "NA";

  this.horaProgramada = normalize(this.horaProgramada);
  this.placa = normalize(this.placa);
  this.trailer = normalize(this.trailer);
  this.conductor = normalize(this.conductor);
  this.transportadora = normalize(this.transportadora);
  this.cliente = normalize(this.cliente);
  this.destino = normalize(this.destino);
  this.producto = normalize(this.producto);

  next();
});

const ProgramacionDespacho =
  mongoose.models.ProgramacionDespacho ||
  mongoose.model("ProgramacionDespacho", ProgramacionDespachoSchema);

export default ProgramacionDespacho;