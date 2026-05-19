import TrazabilidadLoteProduccion from "../../models/ModuloLaboratorio/TrazabilidadRegistroDeLotesDeProduccionmodels.js";

const pestañasPermitidas = ["intermedios", "terminado", "despachos"];

export const createTrazabilidadLoteProduccion = async (req, res) => {
  try {
    const {
      formato = "4-LAB-032",
      version = "3",
      tabla = "Trazabilidad de lote de producción",
      fechaRegistro,
      fechaGuardado,
      tipoPestana,
      comentario = "",
      data = {},
    } = req.body;

    if (!fechaRegistro) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de registro es obligatoria.",
      });
    }

    if (!tipoPestana || !pestañasPermitidas.includes(tipoPestana)) {
      return res.status(400).json({
        ok: false,
        message: "El tipo de pestaña es obligatorio o no es válido.",
      });
    }

    const nuevoRegistro = await TrazabilidadLoteProduccion.create({
      formato,
      version,
      tabla,
      fechaRegistro,
      fechaGuardado: fechaGuardado || new Date().toISOString(),
      tipoPestana,
      comentario,
      data,
    });

    return res.status(201).json({
      ok: true,
      message: "Registro guardado correctamente.",
      id: nuevoRegistro._id,
      data: nuevoRegistro,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al guardar el registro.",
    });
  }
};

export const updateTrazabilidadLoteProduccion = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      formato,
      version,
      tabla,
      fechaRegistro,
      fechaGuardado,
      tipoPestana,
      comentario = "",
      data = {},
    } = req.body;

    if (!fechaRegistro) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de registro es obligatoria.",
      });
    }

    if (!tipoPestana || !pestañasPermitidas.includes(tipoPestana)) {
      return res.status(400).json({
        ok: false,
        message: "El tipo de pestaña es obligatorio o no es válido.",
      });
    }

    const registro = await TrazabilidadLoteProduccion.findByIdAndUpdate(
      id,
      {
        formato,
        version,
        tabla,
        fechaRegistro,
        fechaGuardado: fechaGuardado || new Date().toISOString(),
        tipoPestana,
        comentario,
        data,
      },
      { new: true, runValidators: true }
    );

    if (!registro) {
      return res.status(404).json({
        ok: false,
        message: "Registro no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Registro actualizado correctamente.",
      id: registro._id,
      data: registro,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al actualizar el registro.",
    });
  }
};

export const getTrazabilidadLoteProduccionByDate = async (req, res) => {
  try {
    const { fecha, tipoPestana } = req.query;

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de consulta es obligatoria.",
      });
    }

    const filtro = { fechaRegistro: fecha };

    if (tipoPestana) {
      filtro.tipoPestana = tipoPestana;
    }

    const registros = await TrazabilidadLoteProduccion.find(filtro).sort({
      createdAt: 1,
    });

    return res.json({
      ok: true,
      total: registros.length,
      message: registros.length
        ? "Registros encontrados."
        : "No hay registros para esta fecha.",
      data: registros,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al consultar por fecha.",
    });
  }
};

export const getFechasTrazabilidadLoteProduccion = async (req, res) => {
  try {
    const { tipoPestana } = req.query;

    const filtro = {};

    if (tipoPestana) {
      filtro.tipoPestana = tipoPestana;
    }

    const fechas = await TrazabilidadLoteProduccion.distinct(
      "fechaRegistro",
      filtro
    );

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

export const getAllTrazabilidadLoteProduccion = async (req, res) => {
  try {
    const registros = await TrazabilidadLoteProduccion.find().sort({
      createdAt: -1,
    });

    return res.json({
      ok: true,
      total: registros.length,
      data: registros,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al listar registros.",
    });
  }
};

export const getLatestTrazabilidadLoteProduccion = async (req, res) => {
  try {
    const { tipoPestana } = req.query;

    const filtro = {};

    if (tipoPestana) {
      filtro.tipoPestana = tipoPestana;
    }

    const registro = await TrazabilidadLoteProduccion.findOne(filtro).sort({
      createdAt: -1,
    });

    return res.json({
      ok: true,
      message: registro ? "Último registro encontrado." : "No hay registros.",
      data: registro,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al consultar el último registro.",
    });
  }
};

export const deleteTrazabilidadLoteProduccion = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await TrazabilidadLoteProduccion.findByIdAndDelete(id);

    if (!registro) {
      return res.status(404).json({
        ok: false,
        message: "Registro no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Registro eliminado correctamente.",
      data: registro,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al eliminar el registro.",
    });
  }
};