import mongoose from "mongoose";

const { Schema } = mongoose;

const TotalesSchema = new Schema(
  {
    renConsumo: { type: Number, default: null },
    prodTotal: { type: Number, default: null },
    tk402Total: { type: Number, default: null },
    renNivelTotal: { type: Number, default: null },
    ab801Total: { type: Number, default: null },
    difProdTraslado: { type: Number, default: null },
    errorTrasladoPct: { type: Number, default: null },
    // Nombres claros para análisis futuro
    difProdTk402: { type: Number, default: null },
    errorProdTk402Pct: { type: Number, default: null },
    difRenNiveles: { type: Number, default: null },
    errorRenNivelesPct: { type: Number, default: null },
    difAcumRenProd: { type: Number, default: null },
    errorTotalizadoresPct: { type: Number, default: null },
    fcPorTotalizador: { type: Number, default: null },
    fcRenNiveles: { type: Number, default: null },
  },
  { _id: false }
);

const TurnoSchema = new Schema(
  {
    idFrontend: { type: String, default: "" },

    fecha: { type: String, trim: true, default: "" },
    turno: { type: String, trim: true, default: "" },
    turnoNumero: { type: Number, default: null },
    claveFila: { type: String, trim: true, default: "" },

    modalidadTurno: {
      type: String,
      enum: ["8H", "12H", "N/D"],
      default: "N/D",
    },

    posicionTurnoDia: { type: Number, default: null },
    activo: { type: Boolean, default: true },

    // Datos digitados
    renInicio: { type: Schema.Types.Mixed, default: "" },
    renFinal: { type: Schema.Types.Mixed, default: "" },

    prodInicio: { type: Schema.Types.Mixed, default: "" },
    prodFinal: { type: Schema.Types.Mixed, default: "" },

    tk402AInicio: { type: Schema.Types.Mixed, default: "" },
    tk402AFinal: { type: Schema.Types.Mixed, default: "" },
    tk402BInicio: { type: Schema.Types.Mixed, default: "" },
    tk402BFinal: { type: Schema.Types.Mixed, default: "" },

    tanque1: { type: String, trim: true, default: "" },
    factor1: { type: Schema.Types.Mixed, default: "" },
    nivel1Inicio: { type: Schema.Types.Mixed, default: "" },
    nivel1Final: { type: Schema.Types.Mixed, default: "" },

    tanque2: { type: String, trim: true, default: "" },
    factor2: { type: Schema.Types.Mixed, default: "" },
    nivel2Inicio: { type: Schema.Types.Mixed, default: "" },
    nivel2Final: { type: Schema.Types.Mixed, default: "" },

    ab801Inicio: { type: Schema.Types.Mixed, default: "" },
    ab801Final: { type: Schema.Types.Mixed, default: "" },

    // Cálculos guardados para análisis
    renConsumo: { type: Number, default: null },
    prodTotal: { type: Number, default: null },
    tk402Total: { type: Number, default: null },
    renNivelTotal: { type: Number, default: null },
    ab801Total: { type: Number, default: null },

    difProdTraslado: { type: Number, default: null },
    errorTrasladoPct: { type: Number, default: null },

    difProdTk402: { type: Number, default: null },
    errorProdTk402Pct: { type: Number, default: null },

    difRenNiveles: { type: Number, default: null },
    errorRenNivelesPct: { type: Number, default: null },

    difAcumRenProd: { type: Number, default: null },
    errorTotalizadoresPct: { type: Number, default: null },

    fcPorTotalizador: { type: Number, default: null },
    fcRenNiveles: { type: Number, default: null },
  },
  { _id: false }
);

const DiaSchema = new Schema(
  {
    diaGrupo: { type: Number, default: null },
    fecha: { type: String, trim: true, default: "" },

    modalidadTurno: {
      type: String,
      enum: ["8H", "12H", "N/D"],
      default: "N/D",
    },

    turnos: {
      type: [TurnoSchema],
      default: [],
    },

    totals: {
      type: TotalesSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

const ResumenTurnosSchema = new Schema(
  {
    filasEstructurales: { type: Number, default: 0 },
    filasActivas: { type: Number, default: 0 },
    dias8Horas: { type: Number, default: 0 },
    dias12Horas: { type: Number, default: 0 },
  },
  { _id: false }
);

const SeguimientoTotalizadoresU400Schema = new Schema(
  {
    registroNombre: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },

    mes: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, "El mes debe tener formato YYYY-MM"],
    },

    anio: {
      type: Number,
      required: true,
      index: true,
    },

    mesNumero: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },

    fechaInicioMes: { type: String, trim: true, default: "" },
    fechaFinMes: { type: String, trim: true, default: "" },

    factor402: { type: Number, default: 9620 },
    factor801: { type: Number, default: 139982 },

    // Se conserva la estructura cruda del frontend para recargar la tabla tipo Excel
    rows: { type: Array, default: [] },
    rowsNormalizadas: { type: Array, default: [] },
    rowsActivas: { type: Array, default: [] },

    // Estructura limpia para análisis
    dias: {
      type: [DiaSchema],
      default: [],
    },

    resumenTurnos: {
      type: ResumenTurnosSchema,
      default: () => ({}),
    },

    totals: {
      type: TotalesSchema,
      default: () => ({}),
    },

    estado: {
      type: String,
      enum: ["BORRADOR", "CERRADO", "ANULADO"],
      default: "BORRADOR",
      index: true,
    },

    creadoPor: {
      type: Schema.Types.Mixed,
      default: null,
    },

    actualizadoPor: {
      type: Schema.Types.Mixed,
      default: null,
    },

    cerradoPor: {
      type: Schema.Types.Mixed,
      default: null,
    },

    cerradoEn: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "seguimiento_totalizadores_u400",
  }
);

SeguimientoTotalizadoresU400Schema.index({ anio: 1, mesNumero: 1 });
SeguimientoTotalizadoresU400Schema.index({ "dias.fecha": 1 });
SeguimientoTotalizadoresU400Schema.index({ estado: 1, updatedAt: -1 });

export default mongoose.model(
  "SeguimientoTotalizadoresU400",
  SeguimientoTotalizadoresU400Schema
);