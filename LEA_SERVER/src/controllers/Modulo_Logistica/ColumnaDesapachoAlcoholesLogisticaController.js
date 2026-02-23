import ColumnaAlcoholModel from "../../models/Modulo_Logistica/ColumnaDespachoAlcoholesLogisticaModels.js";

/* ========== CREAR ========== */
export const crearColumnaAlcohol = async (req, res) => {
  try {
    let { key, nombre, unidad, totalizable, rolesDigitables } = req.body;

    if (!nombre || !key) {
      return res.status(400).json({
        message: "Los campos 'nombre' y 'key' son obligatorios.",
      });
    }

    key = key.toLowerCase().trim();
    totalizable = Boolean(totalizable);

    const roles = Array.isArray(rolesDigitables)
      ? rolesDigitables.map((r) => String(r).toLowerCase().trim())
      : ["developer"]; // default seguro

    const ColumnaAlcohol = await ColumnaAlcoholModel.create({
      key,
      nombre: nombre.trim(),
      unidad: unidad?.trim() || "",
      totalizable,
      rolesDigitables: roles,
    });

    res.status(201).json(ColumnaAlcohol);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe una columna con esa key.",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

/* ========== LISTAR ========== */
export const listarColumnaAlcoholes = async (req, res) => {
  try {
    const Columnaes = await ColumnaAlcoholModel.find({ activo: true }).sort({
      createdAt: 1,
    });

    res.json(Columnaes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ========== EDITAR ========== */
export const editarColumnaAlcohol = async (req, res) => {
  try {
    let { key, nombre, unidad, totalizable, activo, rolesDigitables } = req.body;

    if (req.body.hasOwnProperty("totalizable") && typeof totalizable !== "boolean") {
      return res.status(400).json({
        message: "El campo 'totalizable' debe ser boolean (true/false).",
      });
    }

    if (req.body.hasOwnProperty("key") && typeof key === "string") {
      key = key.toLowerCase().trim();
    }

    if (req.body.hasOwnProperty("rolesDigitables")) {
      if (!Array.isArray(rolesDigitables)) {
        return res.status(400).json({
          message: "El campo 'rolesDigitables' debe ser un arreglo.",
        });
      }
      rolesDigitables = rolesDigitables.map((r) => String(r).toLowerCase().trim());
    }

    const updateDoc = {
      ...(req.body.hasOwnProperty("key") ? { key } : {}),
      ...(req.body.hasOwnProperty("nombre") ? { nombre } : {}),
      ...(req.body.hasOwnProperty("unidad") ? { unidad } : {}),
      ...(req.body.hasOwnProperty("totalizable") ? { totalizable } : {}),
      ...(req.body.hasOwnProperty("activo") ? { activo } : {}),
      ...(req.body.hasOwnProperty("rolesDigitables") ? { rolesDigitables } : {}),
    };

    const Columna = await ColumnaAlcoholModel.findByIdAndUpdate(
      req.params.id,
      updateDoc,
      { new: true, runValidators: true }
    );

    if (!Columna) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.json(Columna);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ========== DESACTIVAR ========== */
export const desactivarColumnaAlcohol = async (req, res) => {
  try {
    const Columna = await ColumnaAlcoholModel.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!Columna) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
