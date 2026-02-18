import MedidoresAgua from "../models/MedidoresEnergiaModel.js";

/* ================= CREAR ================= */
export const crearMedicionAgua = async (req, res) => {
  try {
    const {
      fecha,
      hora,
      responsable,
      observaciones,
      lecturas,
    } = req.body;

    if (!fecha || !hora || !responsable || !lecturas) {
      return res.status(400).json({
        message: "Campos obligatorios incompletos",
      });
    }

    const nuevaMedicion = new MedidoresAgua({
      fecha,
      hora,
      responsable,
      observaciones,
      lecturas,
    });

    const guardado = await nuevaMedicion.save();

    res.status(201).json(guardado);
  } catch (error) {
    res.status(500).json({
      message: "Error al crear medición de energia",
      error: error.message,
    });
  }
};

/* ================= LISTAR ================= */
export const obtenerMedicionesAgua = async (req, res) => {
  try {
    const mediciones = await MedidoresAgua.find().sort({
      createdAt: 1,
    });

    res.json(mediciones);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener mediciones de energia",
      error: error.message,
    });
  }
};

/* ================= OBTENER POR ID ================= */
export const obtenerMedicionAguaPorId = async (req, res) => {
  try {
    const medicion = await MedidoresAgua.findById(req.params.id);

    if (!medicion) {
      return res.status(404).json({
        message: "Medición de energia no encontrada",
      });
    }

    res.json(medicion);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener medición de energia",
      error: error.message,
    });
  }
};

/* ================= ACTUALIZAR ================= */
export const actualizarMedicionAgua = async (req, res) => {
  try {
    const medicionActualizada = await MedidoresAgua.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(medicionActualizada);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar medición de agua",
      error: error.message,
    });
  }
};

/* ================= ELIMINAR ================= */
export const eliminarMedicionAgua = async (req, res) => {
  try {
    await MedidoresAgua.findByIdAndDelete(req.params.id);

    res.json({
      message: "Medición de agua eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar medición de agua",
      error: error.message,
    });
  }
};
