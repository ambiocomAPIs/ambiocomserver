import Tanques from "../models/TanquesModels.js";

// Obtener todos los tanques
export const getTanques = async (req, res) => {
  try {
    const tanques = await Tanques.find();
    res.status(200).json(tanques);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tanques" });
  }
};

// Crear un nuevo tanque
export const createTanque = async (req, res) => {
  console.log("que llega:", req.body);
  
  try {
    const { NombreTanque } = req.body;

    // Verificar si ya existe un tanque con ese nombre (case-insensitive opcional)
    const existe = await Tanques.findOne({ NombreTanque });

    if (existe) {
      return res.status(400).json({ error: "Ya existe un tanque con ese nombre" });
    }

    const nuevoTanque = new Tanques(req.body);
    const tanqueGuardado = await nuevoTanque.save();
    res.status(201).json(tanqueGuardado);
  } catch (error) {
    res.status(500).json({ error: "Error al crear tanque" });
  }
};

// Actualizar un tanque existente
export const updateTanque = async (req, res) => {
  try {
    const tanqueActualizado = await Tanques.findByIdAndUpdate(
      req.params.id,
      req.body,  // Aquí también puede venir VolumenTotal
      { new: true }
    );
    res.status(200).json(tanqueActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar tanque" });
  }
};

// Eliminar un tanque
export const deleteTanque = async (req, res) => {
  try {
    await Tanques.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensaje: "Tanque eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar tanque" });
  }
};
