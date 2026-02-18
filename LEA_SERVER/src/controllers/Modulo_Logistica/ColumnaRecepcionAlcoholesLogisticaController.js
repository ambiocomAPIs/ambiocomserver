import RecepcionAlcoholModel from "../../models/Modulo_Logistica/ColumnaRecepcionAlcoholesLogisticaModels.js";

/* ========== CREAR ========== */
export const crearRecepcionAlcohol = async (req, res) => {
  try {
    const { key, nombre, unidad, totalizable } = req.body;

    // Validación dura: totalizable debe venir sí o sí
    if (typeof totalizable !== "boolean") {
      return res.status(400).json({
        message: "El campo 'totalizable' es obligatorio y debe ser boolean (true/false).",
      });
    }

    const recepcionAlcohol = await RecepcionAlcoholModel.create({
      key,
      nombre,
      unidad,
      totalizable,
    });

    res.status(201).json(recepcionAlcohol);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe una columna con esa key.",
      });
    }

    res.status(400).json({ message: error.message });
  }
};

/* ========== LISTAR ========== */
export const listarRecepcionAlcoholes = async (req, res) => {
  try {
    const recepciones = await RecepcionAlcoholModel
      .find({ activo: true })
      .sort({ createdAt: 1 });

    res.json(recepciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========== EDITAR ========== */
export const editarRecepcionAlcohol = async (req, res) => {
  try {
    const { key, nombre, unidad, totalizable, activo } = req.body;

    // Si viene totalizable, validarlo
    if (req.body.hasOwnProperty("totalizable") && typeof totalizable !== "boolean") {
      return res.status(400).json({
        message: "El campo 'totalizable' debe ser boolean (true/false).",
      });
    }

    const recepcion = await RecepcionAlcoholModel.findByIdAndUpdate(
      req.params.id,
      { key, nombre, unidad, totalizable, activo },
      { new: true, runValidators: true } // 👈 valida con el schema
    );

    if (!recepcion) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.json(recepcion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ========== DESACTIVAR ========== */
export const desactivarRecepcionAlcohol = async (req, res) => {
  try {
    const recepcion = await RecepcionAlcoholModel.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!recepcion) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
