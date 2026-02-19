import Conductor from "../../../models/Modulo_Logistica/Conductores/Conductor.js";

// Crear conductor
export const crearConductor = async (req, res) => {
  try {
    const conductor = new Conductor(req.body);
    const saved = await conductor.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos
export const obtenerConductores = async (req, res) => {
  try {
    const conductores = await Conductor.find().sort({ createdAt: -1 });
    res.json(conductores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener uno
export const obtenerConductor = async (req, res) => {
  try {
    const conductor = await Conductor.findById(req.params.id);
    if (!conductor) return res.status(404).json({ message: "No encontrado" });
    res.json(conductor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar
export const actualizarConductor = async (req, res) => {
  try {
    const updated = await Conductor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar
export const eliminarConductor = async (req, res) => {
  try {
    await Conductor.findByIdAndDelete(req.params.id);
    res.json({ message: "Conductor eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
