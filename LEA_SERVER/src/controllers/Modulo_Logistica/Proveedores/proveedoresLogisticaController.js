import mongoose from "mongoose";
import ProveedorLogistica from "../../../models/Modulo_Logistica/Proveedores/proveedoresLogisticaModel.js";

export const obtenerProveedoresLogistica = async (req, res) => {
  try {
    const proveedores = await ProveedorLogistica.find().sort({
      proveedor: 1,
      createdAt: -1,
    });

    res.status(200).json(proveedores);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);

    res.status(500).json({
      message: "Error al obtener los proveedores.",
      error: error.message,
    });
  }
};

export const crearProveedorLogistica = async (req, res) => {
  try {
    const {
      proveedor,
      nit,
      contacto,
      telefono,
      emailContacto,
      tipoProveedor,
    } = req.body;

    if (!proveedor || !tipoProveedor) {
      return res.status(400).json({
        message: "Proveedor y Tipo de proveedor son obligatorios.",
      });
    }

    const nuevoProveedor = new ProveedorLogistica({
      proveedor: proveedor.trim(),
      nit: nit?.trim() || "",
      contacto: contacto?.trim() || "",
      telefono: telefono?.trim() || "",
      emailContacto: emailContacto?.trim() || "",
      tipoProveedor: tipoProveedor.trim(),
    });

    const proveedorGuardado = await nuevoProveedor.save();

    res.status(201).json(proveedorGuardado);
  } catch (error) {
    console.error("Error al crear proveedor:", error);

    res.status(500).json({
      message: "Error al crear el proveedor.",
      error: error.message,
    });
  }
};

export const actualizarProveedorLogistica = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID de proveedor no válido.",
      });
    }

    const {
      proveedor,
      nit,
      contacto,
      telefono,
      emailContacto,
      tipoProveedor,
    } = req.body;

    if (!proveedor || !tipoProveedor) {
      return res.status(400).json({
        message: "Proveedor y Tipo de proveedor son obligatorios.",
      });
    }

    const proveedorActualizado = await ProveedorLogistica.findByIdAndUpdate(
      id,
      {
        proveedor: proveedor.trim(),
        nit: nit?.trim() || "",
        contacto: contacto?.trim() || "",
        telefono: telefono?.trim() || "",
        emailContacto: emailContacto?.trim() || "",
        tipoProveedor: tipoProveedor.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!proveedorActualizado) {
      return res.status(404).json({
        message: "Proveedor no encontrado.",
      });
    }

    res.status(200).json(proveedorActualizado);
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);

    res.status(500).json({
      message: "Error al actualizar el proveedor.",
      error: error.message,
    });
  }
};

export const eliminarProveedorLogistica = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID de proveedor no válido.",
      });
    }

    const proveedorEliminado = await ProveedorLogistica.findByIdAndDelete(id);

    if (!proveedorEliminado) {
      return res.status(404).json({
        message: "Proveedor no encontrado.",
      });
    }

    res.status(200).json({
      message: "Proveedor eliminado correctamente.",
      proveedor: proveedorEliminado,
    });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);

    res.status(500).json({
      message: "Error al eliminar el proveedor.",
      error: error.message,
    });
  }
};