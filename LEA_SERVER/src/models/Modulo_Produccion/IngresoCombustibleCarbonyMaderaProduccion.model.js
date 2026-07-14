import mongoose from "mongoose";

const TIPOS_COMBUSTIBLE = ["Carbón", "Madera"];
const ESTADOS_SAP = ["", "Pendiente", "Reportado", "No aplica"];

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const calcularCampos = (doc) => {
  const pesoMinaKg = toNumber(doc.pesoMinaKg);
  const pesoKgAmbiocom = toNumber(doc.pesoKgAmbiocom);
  const precioUnitarioTon = toNumber(doc.precioUnitarioTon);
  const iva = toNumber(doc.iva);
  const notaDebitoCredito = toNumber(doc.notaDebitoCredito);

  doc.diferenciaKg = pesoKgAmbiocom - pesoMinaKg;
  doc.pesoTonRecibidas = pesoKgAmbiocom / 1000;
  doc.precioTotal = doc.pesoTonRecibidas * precioUnitarioTon;
  doc.valorFacturado = doc.precioTotal + iva + notaDebitoCredito;
};

const IngresoCombustibleCarbonyMaderaSchema = new mongoose.Schema(
  {
    frontendId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },

    fechaRecepcion: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"],
      index: true,
    },

    mina: {
      type: String,
      trim: true,
      default: "",
    },

    remision: {
      type: String,
      trim: true,
      default: "",
    },

    numeroFactura: {
      type: String,
      trim: true,
      default: "",
    },

    pesoMinaKg: {
      type: Number,
      default: 0,
    },

    tipoCombustible: {
      type: String,
      enum: TIPOS_COMBUSTIBLE,
      default: "Carbón",
      index: true,
    },

    pesoKgAmbiocom: {
      type: Number,
      default: 0,
    },

    diferenciaKg: {
      type: Number,
      default: 0,
    },

    pesoTonRecibidas: {
      type: Number,
      default: 0,
    },

    precioUnitarioTon: {
      type: Number,
      default: 0,
    },

    precioTotal: {
      type: Number,
      default: 0,
    },

    iva: {
      type: Number,
      default: 0,
    },

    valorFacturado: {
      type: Number,
      default: 0,
    },

    notaDebitoCredito: {
      type: Number,
      default: 0,
    },

    reportadoSap: {
      type: String,
      enum: ESTADOS_SAP,
      default: "",
    },

    observacion: {
      type: String,
      trim: true,
      default: "",
    },

    activo: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

IngresoCombustibleCarbonyMaderaSchema.index({ activo: 1, fechaRecepcion: 1 });
IngresoCombustibleCarbonyMaderaSchema.index({ activo: 1, fechaRecepcion: 1, tipoCombustible: 1 });

IngresoCombustibleCarbonyMaderaSchema.pre("validate", function calcularAntesDeValidar(next) {
  calcularCampos(this);
  next();
});

IngresoCombustibleCarbonyMaderaSchema.pre("save", function calcularAntesDeGuardar(next) {
  calcularCampos(this);
  next();
});

const IngresoCombustibleCarbonyMadera = mongoose.model(
  "IngresoCombustibleCarbonyMadera",
  IngresoCombustibleCarbonyMaderaSchema
);

export default IngresoCombustibleCarbonyMadera;