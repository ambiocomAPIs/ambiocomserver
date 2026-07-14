import mongoose from "mongoose";

const MATERIAL_OPTIONS = ["Carbón", "Madera", "Bagazo"];

const MaterialCombustibleDetailsSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    material: {
      type: String,
      enum: MATERIAL_OPTIONS,
      default: "Carbón",
      index: true,
    },

    weightCV: {
      type: Number,
      default: 0,
      min: 0,
    },

    weightCN: {
      type: Number,
      default: 0,
      min: 0,
    },

    initialTon: {
      type: Number,
      default: 0,
    },

    stockMinimoTon: {
      type: Number,
      default: 0,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    observacion: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
    collection: "materiales_combustibles",
  }
);

MaterialCombustibleDetailsSchema.index({ material: 1, name: 1 });
MaterialCombustibleDetailsSchema.index({ active: 1, material: 1 });

const MaterialCombustibleDetails =
  mongoose.models.MaterialCombustibleDetails ||
  mongoose.model("MaterialCombustibleDetails", MaterialCombustibleDetailsSchema);

export default MaterialCombustibleDetails;