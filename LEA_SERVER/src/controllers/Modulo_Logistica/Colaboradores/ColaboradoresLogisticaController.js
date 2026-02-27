import Personal from "../../../models/Modulo_Logistica/Colaboradores/colaboradoresLogisticaModel.js";

// GET /api/personal
export const getPersonal = async (req, res) => {
  try {
    const data = await Personal.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener personal", error });
  }
};

// POST /api/personal
export const createPersonal = async (req, res) => {
  try {
    const { nombres, area } = req.body;

    if (!nombres || !area) {
      return res.status(400).json({ message: "nombres y area son obligatorios" });
    }

    const nuevo = await Personal.create({ nombres, area });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ message: "Error al crear personal", error });
  }
};

// PUT /api/personal/:id  ✅ EDITAR
export const updatePersonal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, area } = req.body;

    if (!nombres || !area) {
      return res.status(400).json({ message: "nombres y area son obligatorios" });
    }

    const actualizado = await Personal.findByIdAndUpdate(
      id,
      { nombres, area },
      { new: true, runValidators: true }
    );

    if (!actualizado) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar personal", error });
  }
};

// DELETE /api/personal/:id
export const deletePersonal = async (req, res) => {
  try {
    const { id } = req.params;

    const eliminado = await Personal.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.json({ message: "Registro eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar personal", error });
  }
};