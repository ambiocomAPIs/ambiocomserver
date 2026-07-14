import mongoose from "mongoose";

const CarbonDailySchema = new mongoose.Schema(
  {
    inicial: {
      type: Number,
      default: null,
    },
    entrada: {
      type: Number,
      default: null,
    },
    paladasCV: {
      type: Number,
      default: null,
    },
    paladasCN: {
      type: Number,
      default: null,
    },
    ajuste: {
      type: Number,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const IngresosCombustiblesAplicadosSchema = new mongoose.Schema(
  {
    registros: {
      type: Number,
      default: 0,
    },
    viajes: {
      type: Number,
      default: 0,
    },
    toneladas: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const ConsumoCombustiblesSchema = new mongoose.Schema(
  {
    fecha: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
      unique: true,
    },

    tolvaPrincipal: {
      type: Number,
      default: null,
    },

    tolvasAuxiliares: {
      type: Number,
      default: null,
    },

    observacion: {
      type: String,
      default: "",
      trim: true,
    },

    carbons: {
      type: Map,
      of: CarbonDailySchema,
      default: {},
    },

    ingresosCombustiblesAplicados: {
      type: IngresosCombustiblesAplicadosSchema,
      default: () => ({
        registros: 0,
        viajes: 0,
        toneladas: 0,
      }),
    },

    activo: {
      type: Boolean,
      default: true,
      index: true,
    },

    creadoPor: {
      type: String,
      default: "",
      trim: true,
    },

    actualizadoPor: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      flattenMaps: true,
    },
    toObject: {
      virtuals: true,
      flattenMaps: true,
    },
  }
);

ConsumoCombustiblesSchema.index({ fecha: 1, activo: 1 });

const ConsumoCombustibles =
  mongoose.models.ConsumoCombustibles ||
  mongoose.model(
    "ConsumoCombustibles",
    ConsumoCombustiblesSchema,
    "consumos_combustibles"
  );

export default ConsumoCombustibles;