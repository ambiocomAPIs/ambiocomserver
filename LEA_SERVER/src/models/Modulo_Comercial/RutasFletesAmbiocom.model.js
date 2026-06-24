import mongoose from "mongoose";

const { Schema } = mongoose;

const DEFAULT_TRANSPORTADORAS = ["PANANTRA", "W CARGO", "SIERRA"];

const emptyRow = (transportadorasLength = DEFAULT_TRANSPORTADORAS.length) => ({
  ciudadOrigen: "",
  departamentoOrigen: "",
  ciudadDestino: "",
  departamentoDestino: "",
  tipoVehiculo: "",
  especificacion: "",
  cantidadLitros: "",
  fleteUnitarioCotizado: "",
  fletes: Array.from({ length: transportadorasLength }, () => ""),
  observaciones: "",
});

const RowSchema = new Schema(
  {
    ciudadOrigen: {
      type: String,
      trim: true,
      default: "",
      uppercase: true,
    },

    departamentoOrigen: {
      type: String,
      trim: true,
      default: "",
      uppercase: true,
    },

    ciudadDestino: {
      type: String,
      trim: true,
      default: "",
      uppercase: true,
    },

    departamentoDestino: {
      type: String,
      trim: true,
      default: "",
      uppercase: true,
    },

    tipoVehiculo: {
      type: String,
      trim: true,
      default: "",
      uppercase: true,
    },

    especificacion: {
      type: String,
      trim: true,
      default: "",
      uppercase: true,
    },

    cantidadLitros: {
      type: Schema.Types.Mixed,
      default: "",
    },

    fleteUnitarioCotizado: {
      type: Schema.Types.Mixed,
      default: "",
    },

    fletes: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    observaciones: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const RutasFletesAmbiocomSchema = new Schema(
  {
    nombre: {
      type: String,
      trim: true,
      default: "Matriz rutas fletes Ambiocom",
    },

    descripcion: {
      type: String,
      trim: true,
      default: "",
    },

    transportadoras: {
      type: [String],
      default: DEFAULT_TRANSPORTADORAS,
      set: (items) =>
        Array.isArray(items) && items.length
          ? [
              ...new Set(
                items
                  .map((item) => String(item || "").trim().toUpperCase())
                  .filter(Boolean)
              ),
            ]
          : DEFAULT_TRANSPORTADORAS,
    },

    rows: {
      type: [RowSchema],
      default: () => [emptyRow(DEFAULT_TRANSPORTADORAS.length)],
    },

    activo: {
      type: Boolean,
      default: true,
      index: true,
    },

    creadoPor: {
      type: String,
      default: "",
    },

    actualizadoPor: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "rutas_fletes_ambiocom",
  }
);

RutasFletesAmbiocomSchema.pre("validate", function normalizeFletes(next) {
  const transportadorasLength = this.transportadoras?.length || 0;

  if (!Array.isArray(this.rows) || !this.rows.length) {
    this.rows = [emptyRow(transportadorasLength)];
  }

  this.rows = this.rows.map((row) => {
    const currentFletes = Array.isArray(row.fletes) ? row.fletes : [];

    row.fletes = Array.from(
      { length: transportadorasLength },
      (_, index) => currentFletes[index] ?? ""
    );

    return row;
  });

  next();
});

const RutasFletesAmbiocom = mongoose.model(
  "RutasFletesAmbiocom",
  RutasFletesAmbiocomSchema
);

export { DEFAULT_TRANSPORTADORAS, emptyRow };

export default RutasFletesAmbiocom;