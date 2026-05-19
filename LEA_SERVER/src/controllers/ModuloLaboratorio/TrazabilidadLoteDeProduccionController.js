import TrazabilidadLaboratorio from "../../models/ModuloLaboratorio/TrazabilidadLoteDeProduccionModel.js";

export const createTrazabilidadLaboratorio = async (req, res) => {
  try {
    const {
      formato = "4-LAB-032",
      version = "3",
      pagina = "3-3",
      tabla = "Trazabilidad de lote de producción",
      fechaRegistro,
      fechaGuardado,
      encabezado = {},
      materiaPrima = {},
      analisisFisicoquimicoAlimentacion,
      observacionesGenerales,
    } = req.body;

    if (!fechaRegistro) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de registro es obligatoria.",
      });
    }

    if (!Array.isArray(analisisFisicoquimicoAlimentacion)) {
      return res.status(400).json({
        ok: false,
        message:
          "La data de la tabla debe enviarse en analisisFisicoquimicoAlimentacion.",
      });
    }

    const data = await TrazabilidadLaboratorio.create({
      formato,
      version,
      pagina,
      tabla,
      fechaRegistro,
      fechaGuardado: fechaGuardado || new Date().toISOString(),
      encabezado,
      materiaPrima,
      analisisFisicoquimicoAlimentacion,
      observacionesGenerales,
    });

    return res.status(201).json({
      ok: true,
      message: "Registro guardado correctamente.",
      id: data._id,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al guardar el registro.",
    });
  }
};

export const getFechasTrazabilidadLaboratorio = async (req, res) => {
  try {
    const fechas = await TrazabilidadLaboratorio.distinct("fechaRegistro");

    return res.json({
      ok: true,
      fechas,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al consultar fechas.",
    });
  }
};

export const updateTrazabilidadLaboratorio = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      formato,
      version,
      pagina,
      tabla,
      fechaRegistro,
      fechaGuardado,
      encabezado,
      materiaPrima,
      analisisFisicoquimicoAlimentacion,
    } = req.body;

    if (!fechaRegistro) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de registro es obligatoria.",
      });
    }

    if (!Array.isArray(analisisFisicoquimicoAlimentacion)) {
      return res.status(400).json({
        ok: false,
        message:
          "La data de la tabla debe enviarse en analisisFisicoquimicoAlimentacion.",
      });
    }

    const data = await TrazabilidadLaboratorio.findByIdAndUpdate(
      id,
      {
        formato,
        version,
        pagina,
        tabla,
        fechaRegistro,
        fechaGuardado: fechaGuardado || new Date().toISOString(),
        encabezado,
        materiaPrima,
        analisisFisicoquimicoAlimentacion,
        observacionesGenerales,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!data) {
      return res.status(404).json({
        ok: false,
        message: "Registro no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Registro actualizado correctamente.",
      id: data._id,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al actualizar el registro.",
    });
  }
};

export const getTrazabilidadLaboratorioByDate = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de consulta es obligatoria.",
      });
    }

    const data = await TrazabilidadLaboratorio.find({
      fechaRegistro: fecha,
    }).sort({ createdAt: 1 });

    return res.json({
      ok: true,
      total: data.length,
      message: data.length
        ? "Registros encontrados."
        : "No hay registros para esta fecha.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al consultar por fecha.",
    });
  }
};

export const getLatestTrazabilidadLaboratorio = async (req, res) => {
  try {
    const data = await TrazabilidadLaboratorio.findOne().sort({
      createdAt: -1,
    });

    return res.json({
      ok: true,
      message: data ? "Último registro encontrado." : "No hay registros.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al consultar el último registro.",
    });
  }
};

export const getAllTrazabilidadLaboratorio = async (req, res) => {
  try {
    const data = await TrazabilidadLaboratorio.find().sort({
      createdAt: -1,
    });

    return res.json({
      ok: true,
      total: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al listar registros.",
    });
  }
};

export const deleteTrazabilidadLaboratorio = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await TrazabilidadLaboratorio.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).json({
        ok: false,
        message: "Registro no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Registro eliminado correctamente.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al eliminar el registro.",
    });
  }
};