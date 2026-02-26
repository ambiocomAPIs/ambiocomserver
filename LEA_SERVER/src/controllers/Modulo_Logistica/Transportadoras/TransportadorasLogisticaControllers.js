import Empresa from "../../../models/Modulo_Logistica/Transportadoras/TransportadorasLogisticaModels.js";

// GET /api/empresas
export const getEmpresas = async (req, res) => {
  try {
    const data = await Empresa.find().sort({ createdAt: -1 });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener empresas", error: error.message });
  }
};

// GET /api/empresas/:id
export const getEmpresaById = async (req, res) => {
  try {
    const item = await Empresa.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Empresa no encontrada" });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener empresa", error: error.message });
  }
};

// POST /api/empresas
export const createEmpresa = async (req, res) => {
  try {
    const { nombreTransportadora, locacion, contactoTelefonico, emailContacto } = req.body;

    if (!nombreTransportadora || !locacion) {
      return res.status(400).json({ message: "nombreTransportadora y locacion son obligatorios" });
    }

    const created = await Empresa.create({
      nombreTransportadora,
      locacion,
      contactoTelefonico: contactoTelefonico ?? "",
      emailContacto: emailContacto ?? "",
    });

    return res.status(201).json(created);
  } catch (error) {
    // si choca el unique index
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Ya existe una transportadora con ese nombre" });
    }
    return res.status(500).json({ message: "Error al crear empresa", error: error.message });
  }
};

// PUT /api/empresas/:id
export const updateEmpresa = async (req, res) => {
  try {
    const { nombreTransportadora, locacion, contactoTelefonico, emailContacto } = req.body;

    const updated = await Empresa.findByIdAndUpdate(
      req.params.id,
      {
        nombreTransportadora,
        locacion,
        contactoTelefonico,
        emailContacto,
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Empresa no encontrada" });
    return res.json(updated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Ya existe una transportadora con ese nombre" });
    }
    return res.status(500).json({ message: "Error al actualizar empresa", error: error.message });
  }
};

// DELETE /api/empresas/:id
export const deleteEmpresa = async (req, res) => {
  try {
    const deleted = await Empresa.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Empresa no encontrada" });
    return res.json({ message: "Empresa eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar empresa", error: error.message });
  }
};