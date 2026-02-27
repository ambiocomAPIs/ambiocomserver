import mongoose from "mongoose";

const alcoholDespachoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: 120,
    },
    tipoProducto: {
      type: String,
      required: [true, "El tipo de producto es obligatorio"],
      trim: true,
      maxlength: 100,
    },
    origen: {
      type: String,
      required: [true, "El origen es obligatorio"],
      trim: true,
      maxlength: 100,
    },
  },
  { timestamps: true }
);

//  Evita duplicados exactos
alcoholDespachoSchema.index({ nombre: 1, tipoProducto: 1, origen: 1 }, { unique: true });

const Alcohol = mongoose.model("Despacho", alcoholDespachoSchema);
export default Alcohol;
