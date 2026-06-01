import Nivel from "../../models/SCADA/NivelesTanqueScada.model.js";

// Crear registro desde AVEVA Edge
export const crearNivel = async (req, res) => {
  try {
    const { fecha, hora, LT650, LT801A, LT801B, LT102B, LT102A } = req.body;

    if (!fecha || !hora) {
      return res.status(400).json({
        ok: false,
        message: "La fecha y la hora son obligatorias",
      });
    }

    const nuevoNivel = await Nivel.create({
      fecha,
      hora,
      LT650,
      LT801A,
      LT801B,
      LT102B,
      LT102A,
    });

    return res.status(201).json({
      ok: true,
      message: "Registro de niveles guardado correctamente",
      data: nuevoNivel,
    });
  } catch (error) {
    console.error("Error creando nivel:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno guardando el registro de niveles",
      error: error.message,
    });
  }
};

// Consultar todos los registros
export const obtenerNiveles = async (req, res) => {
  try {
    const niveles = await Nivel.find()
      .sort({ createdAt: -1 })
      .limit(500);

    return res.status(200).json({
      ok: true,
      total: niveles.length,
      data: niveles,
    });
  } catch (error) {
    console.error("Error consultando niveles:", error);

    return res.status(500).json({
      ok: false,
      message: "Error consultando registros de niveles",
      error: error.message,
    });
  }
};

// Consultar por rango de fechas Mongo createdAt
export const obtenerNivelesPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        ok: false,
        message: "Debe enviar fechaInicio y fechaFin",
      });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    const niveles = await Nivel.find({
      createdAt: {
        $gte: inicio,
        $lte: fin,
      },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      total: niveles.length,
      data: niveles,
    });
  } catch (error) {
    console.error("Error consultando niveles por fecha:", error);

    return res.status(500).json({
      ok: false,
      message: "Error consultando niveles por rango de fechas",
      error: error.message,
    });
  }
};

// Consultar último registro
export const obtenerUltimoNivel = async (req, res) => {
  try {
    const ultimoNivel = await Nivel.findOne().sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      data: ultimoNivel,
    });
  } catch (error) {
    console.error("Error consultando último nivel:", error);

    return res.status(500).json({
      ok: false,
      message: "Error consultando último registro",
      error: error.message,
    });
  }
};