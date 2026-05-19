import ControlCalidadProcesoDestileria from "../../models/ModuloLaboratorio/ControlCalidadProcesoDestileriaModel.js";

export const createControlCalidadProcesoDestileria = async (req, res) => {
  try {
    const {
      formato = "4-LAB-032",
      version = "3",
      pagina = "3-3",
      tabla = "Control de calidad en proceso / Extracciones en la destilería",
      fechaRegistro,
      fechaGuardado,
      observacionesGenerales = "",
      encabezado = {},
      controlCalidad = {},
      extracciones = [],
    } = req.body;

    if (!fechaRegistro) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de registro es obligatoria.",
      });
    }

    if (!Array.isArray(extracciones)) {
      return res.status(400).json({
        ok: false,
        message: "La data de extracciones debe enviarse como array.",
      });
    }

    const data = await ControlCalidadProcesoDestileria.create({
      formato,
      version,
      pagina,
      tabla,
      fechaRegistro,
      fechaGuardado: fechaGuardado || new Date().toISOString(),
      observacionesGenerales,
      encabezado,
      controlCalidad,
      extracciones,
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

export const getFechasControlCalidadProcesoDestileria = async (req, res) => {
  try {
    const fechas = await ControlCalidadProcesoDestileria.distinct("fechaRegistro");

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

export const getControlCalidadProcesoDestileriaByDate = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de consulta es obligatoria.",
      });
    }

    const data = await ControlCalidadProcesoDestileria.find({
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

export const updateControlCalidadProcesoDestileria = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      formato,
      version,
      pagina,
      tabla,
      fechaRegistro,
      fechaGuardado,
      observacionesGenerales = "",
      encabezado = {},
      controlCalidad = {},
      extracciones = [],
    } = req.body;

    if (!fechaRegistro) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de registro es obligatoria.",
      });
    }

    if (!Array.isArray(extracciones)) {
      return res.status(400).json({
        ok: false,
        message: "La data de extracciones debe enviarse como array.",
      });
    }

    const data = await ControlCalidadProcesoDestileria.findByIdAndUpdate(
      id,
      {
        formato,
        version,
        pagina,
        tabla,
        fechaRegistro,
        fechaGuardado: fechaGuardado || new Date().toISOString(),
        observacionesGenerales,
        encabezado,
        controlCalidad,
        extracciones,
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

export const getLatestControlCalidadProcesoDestileria = async (req, res) => {
  try {
    const data = await ControlCalidadProcesoDestileria.findOne().sort({
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

export const getAllControlCalidadProcesoDestileria = async (req, res) => {
  try {
    const data = await ControlCalidadProcesoDestileria.find().sort({
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

export const deleteControlCalidadProcesoDestileria = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await ControlCalidadProcesoDestileria.findByIdAndDelete(id);

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