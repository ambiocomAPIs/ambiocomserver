import Cliente from "../../../models/Modulo_Logistica/Clientes/ClientesLogisticaModel.js";

// GET /api/clientes
export const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    return res.json(clientes);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener clientes",
      error: error.message,
    });
  }
};

// GET /api/clientes/:id
export const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    return res.json(cliente);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener cliente",
      error: error.message,
    });
  }
};

// POST /api/clientes
export const createCliente = async (req, res) => {
  try {
    const { comercial, cliente, tipoOH, incoterm } = req.body;

    if (!comercial || !cliente || !tipoOH || !incoterm) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    const nuevo = await Cliente.create({ comercial, cliente, tipoOH, incoterm });
    return res.status(201).json(nuevo);
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear cliente",
      error: error.message,
    });
  }
};

// PUT /api/clientes/:id
export const updateCliente = async (req, res) => {
  try {
    const { comercial, cliente, tipoOH, incoterm } = req.body;

    const actualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      { comercial, cliente, tipoOH, incoterm },
      { new: true, runValidators: true }
    );

    if (!actualizado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    return res.json(actualizado);
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar cliente",
      error: error.message,
    });
  }
};

// DELETE /api/clientes/:id
export const deleteCliente = async (req, res) => {
  try {
    const eliminado = await Cliente.findByIdAndDelete(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    return res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar cliente",
      error: error.message,
    });
  }
};