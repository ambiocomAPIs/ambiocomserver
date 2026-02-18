import MedicionIngresoCarbonMadera from "../models/MedidoresIngresoCarbonMaderaModels.js";

/* ================= CREAR ================= */
export const crearIngresoCarbonMadera = async (req, res) => {
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

    const nuevaMedicion = new MedicionIngresoCarbonMadera({
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
      message: "Error al crear Ingreso",
      error: error.message,
    });
  }
};

/* ================= LISTAR ================= */
export const obtenerIngresoCarbonMadera = async (req, res) => {
  try {
    const mediciones = await MedicionIngresoCarbonMadera.find().sort({
      createdAt: 1,
    });

    res.json(mediciones);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los ingresos de carbon y madera",
      error: error.message,
    });
  }
};

/* ================= OBTENER POR ID ================= */
export const obtenerIngresoCarbonMaderaPorId = async (req, res) => {
  try {
    const medicion = await MedicionIngresoCarbonMadera.findById(req.params.id);

    if (!medicion) {
      return res.status(404).json({
        message: "ingreso de carbon/madera no encontrada",
      });
    }

    res.json(medicion);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ingreso de carbon/madera",
      error: error.message,
    });
  }
};

/* ================= ACTUALIZAR ================= */
export const actualizarIngresoCarbonMadera = async (req, res) => {
  try {
    const medicionActualizada = await MedicionIngresoCarbonMadera.findByIdAndUpdate(
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
export const eliminarIngresoCarbonMadera = async (req, res) => {
  try {
    await MedicionIngresoCarbonMadera.findByIdAndDelete(req.params.id);

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
