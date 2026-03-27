import Item from "../../models/Dev_Module/Task_RequerimentModels.js";

// Obtener todos
export const obtenerItems = async (req, res) => {
  try {
    const items = await Item.find().sort({
      completado: 1,
      prioridad: -1,
      creadoEn: -1,
    });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los items",
      error: error.message,
    });
  }
};

// Obtener items por rango de fecha
// Por defecto: mes actual + mes anterior
export const obtenerItemsPorFecha = async (req, res) => {
  try {
    const hoy = new Date();

    let fechaInicio;
    let fechaFin;

    if (req.query.fechaInicio && req.query.fechaFin) {
      fechaInicio = new Date(req.query.fechaInicio);
      fechaFin = new Date(req.query.fechaFin);

      // Para incluir todo el día final
      fechaFin.setHours(23, 59, 59, 999);
    } else {
      // Primer día del mes anterior
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1, 0, 0, 0, 0);

      // Último día del mes actual
      fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const items = await Item.find({
      creadoEn: {
        $gte: fechaInicio,
        $lte: fechaFin,
      },
    }).sort({
      completado: 1,
      prioridad: -1,
      creadoEn: -1,
    });

    res.status(200).json({
      mensaje: "Requerimientos obtenidos correctamente",
      rango: {
        fechaInicio,
        fechaFin,
      },
      total: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los requerimientos por fecha",
      error: error.message,
    });
  }
};

// Obtener uno por id
export const obtenerItemPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        mensaje: "Requerimiento no encontrado",
      });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener el Requerimientos",
      error: error.message,
    });
  }
};

// Crear
export const crearItem = async (req, res) => {
  try {
    const { tipo, titulo, descripcion, prioridad, completado } = req.body;

    const nuevoItem = new Item({
      tipo,
      titulo,
      descripcion,
      prioridad,
      completado,
    });

    const itemGuardado = await nuevoItem.save();

    res.status(201).json({
      mensaje: "Requerimiento creado correctamente",
      item: itemGuardado,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al crear el Requerimiento",
      error: error.message,
    });
  }
};

// Actualizar
export const actualizarItem = async (req, res) => {
  try {
    const { id } = req.params;

    const itemActualizado = await Item.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!itemActualizado) {
      return res.status(404).json({
        mensaje: "Requerimiento no encontrado",
      });
    }

    res.status(200).json({
      mensaje: "Requerimiento actualizado correctamente",
      item: itemActualizado,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar el Requerimiento",
      error: error.message,
    });
  }
};

// Cambiar estado completado
export const toggleCompletado = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        mensaje: "Requerimiento no encontrado",
      });
    }

    item.completado = !item.completado;
    await item.save();

    res.status(200).json({
      mensaje: "Estado actualizado correctamente",
      item,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al cambiar el estado del item",
      error: error.message,
    });
  }
};

// Eliminar
export const eliminarItem = async (req, res) => {
  try {
    const { id } = req.params;

    const itemEliminado = await Item.findByIdAndDelete(id);

    if (!itemEliminado) {
      return res.status(404).json({
        mensaje: "Requerimiento no encontrado",
      });
    }

    res.status(200).json({
      mensaje: "Requerimiento eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar el Requerimiento",
      error: error.message,
    });
  }
};