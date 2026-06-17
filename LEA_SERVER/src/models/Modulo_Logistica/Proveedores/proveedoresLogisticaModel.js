import mongoose from "mongoose";

const proveedoresLogisticaSchema = new mongoose.Schema(
  {
    proveedor: {
      type: String,
      required: true,
      trim: true,
    },
    nit: {
      type: String,
      trim: true,
      default: "",
    },
    contacto: {
      type: String,
      trim: true,
      default: "",
    },
    telefono: {
      type: String,
      trim: true,
      default: "",
    },
    emailContacto: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    tipoProveedor: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "proveedoreslogistica",
  }
);

const ProveedoresLogistica = mongoose.model(
  "ProveedoresLogistica",
  proveedoresLogisticaSchema
);

export default ProveedoresLogistica;