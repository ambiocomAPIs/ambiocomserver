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
    consumo: {
      type: Number,
      default: null,
    },
    final: {
      type: Number,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const TotalesDiariosSchema = new mongoose.Schema(
  {
    entradas: { type: Number, default: 0 },

    entradaCarbon: { type: Number, default: 0 },
    entradaMadera: { type: Number, default: 0 },
    entradaBagazo: { type: Number, default: 0 },

    ajusteCarbon: { type: Number, default: 0 },
    ajusteMadera: { type: Number, default: 0 },
    ajusteBagazo: { type: Number, default: 0 },

    consumo: { type: Number, default: 0 },
    consumoCarbon: { type: Number, default: 0 },
    consumoMadera: { type: Number, default: 0 },
    consumoBagazo: { type: Number, default: 0 },

    finalPatio: { type: Number, default: 0 },
    finalCarbonPatio: { type: Number, default: 0 },
    finalMaderaPatio: { type: Number, default: 0 },
    finalBagazoPatio: { type: Number, default: 0 },

    final: { type: Number, default: 0 },
    finalCarbon: { type: Number, default: 0 },
    finalMadera: { type: Number, default: 0 },
    finalBagazo: { type: Number, default: 0 },

    tolvas: { type: Number, default: 0 },
    tolvaCarbon: { type: Number, default: 0 },
    tolvaMadera: { type: Number, default: 0 },
    tolvaBagazo: { type: Number, default: 0 },

    porcentajeCarbon: { type: Number, default: 0 },
    porcentajeMadera: { type: Number, default: 0 },
    porcentajeBagazo: { type: Number, default: 0 },

    consumoAcumulado: { type: Number, default: 0 },

    mixPercentByItem: {
      type: Map,
      of: Number,
      default: () => ({}),
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
      default: () => ({}),
    },

    // Fotografía de las columnas calculadas del resumen diario.
    totales: {
      type: TotalesDiariosSchema,
      default: () => ({}),
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
