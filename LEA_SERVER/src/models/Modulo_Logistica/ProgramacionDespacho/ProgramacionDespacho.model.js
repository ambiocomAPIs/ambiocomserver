import mongoose from "mongoose";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const ProgramacionDespachoSchema = new mongoose.Schema(
  {
    fecha: {
      type: String,
      required: [true, "La fecha es obligatoria."],
      trim: true,
      match: [ISO_DATE_REGEX, 'La fecha debe tener formato "YYYY-MM-DD".'],
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices útiles (opcional, pero recomendado)
ProgramacionDespachoSchema.index({ fecha: 1 });
ProgramacionDespachoSchema.index({ cliente: 1 });
ProgramacionDespachoSchema.index({ producto: 1 });
ProgramacionDespachoSchema.index({ transportadora: 1 });
ProgramacionDespachoSchema.index({ destino: 1 });

// Normalización adicional (por si llegan espacios raros)
ProgramacionDespachoSchema.pre("save", function (next) {
  const normalize = (v) =>
    String(v ?? "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  this.fecha = normalize(this.fecha);
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