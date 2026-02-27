import Alcohol from "../../../models/Modulo_Logistica/Productos/ProductosDespachosModel.js";

// GET /api/alcoholes
export const getAllAlcoholes = async (req, res) => {
  try {
    const items = await Alcohol.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (error) {
    console.error("getAllAlcoholes:", error);
    return res.status(500).json({ message: "Error al obtener alcoholes" });
  }
};

// GET /api/alcoholes/:id
export const getAlcoholById = async (req, res) => {
  try {
    const item = await Alcohol.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Alcohol no encontrado" });
    return res.json(item);
  } catch (error) {
    console.error("getAlcoholById:", error);
    return res.status(400).json({ message: "ID inválido" });
  }
};

// POST /api/alcoholes
export const createAlcohol = async (req, res) => {
  try {
    const { nombre, tipoProducto, origen } = req.body;

    if (!nombre?.trim() || !tipoProducto?.trim() || !origen?.trim()) {
      return res
        .status(400)
        .json({ message: "nombre, tipoProducto y origen son obligatorios" });
    }

    const created = await Alcohol.create({
      nombre: nombre.trim(),
      tipoProducto: tipoProducto.trim(),
      origen: origen.trim(),
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error("createAlcohol:", error);

    if (error?.code === 11000) {
      return res.status(409).json({ message: "Ya existe un alcohol con esos datos" });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Error al crear alcohol" });
  }
};

// PUT /api/alcoholes/:id
export const updateAlcohol = async (req, res) => {
  try {
    const { nombre, tipoProducto, origen } = req.body;

    const updated = await Alcohol.findByIdAndUpdate(
      req.params.id,
      {
        ...(nombre !== undefined ? { nombre: String(nombre).trim() } : {}),
        ...(tipoProducto !== undefined ? { tipoProducto: String(tipoProducto).trim() } : {}),
        ...(origen !== undefined ? { origen: String(origen).trim() } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Alcohol no encontrado" });
    return res.json(updated);
  } catch (error) {
    console.error("updateAlcohol:", error);

    if (error?.code === 11000) {
      return res.status(409).json({ message: "Ya existe un alcohol con esos datos" });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(400).json({ message: "No se pudo actualizar (ID inválido o datos incorrectos)" });
  }
};

// DELETE /api/alcoholes/:id
export const deleteAlcohol = async (req, res) => {
  try {
    const deleted = await Alcohol.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Alcohol no encontrado" });

    return res.json({ message: "Alcohol eliminado", id: deleted._id });
  } catch (error) {
    console.error("deleteAlcohol:", error);
    return res.status(400).json({ message: "ID inválido" });
  }
};
