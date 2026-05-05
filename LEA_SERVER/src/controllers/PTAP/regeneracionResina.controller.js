import RegeneracionResina from "../../models/PTAP/regeneracionResina.model.js";

const getRangoMesActualYAnterior = () => {
  const hoy = new Date();

  const inicioMesAnterior = new Date(
    hoy.getFullYear(),
    hoy.getMonth() - 1,
    1
  );

  const finMesActual = new Date(
    hoy.getFullYear(),
    hoy.getMonth() + 1,
    0
  );

  const formato = (fecha) => fecha.toISOString().slice(0, 10);

  return {
    fechaDesde: formato(inicioMesAnterior),
    fechaHasta: formato(finMesActual),
  };
};

export const crearRegeneracionResina = async (req, res) => {
  try {
    const data = req.body;

    if (!data.fecha || !data.responsable) {
      return res.status(400).json({
        ok: false,
        message: "La fecha y el responsable son obligatorios.",
      });
    }

    const nuevaRegeneracion = await RegeneracionResina.create({
      fecha: data.fecha,
      responsable: data.responsable,

      carbonActivado: {
        ph: data.carbonActivado?.ph ?? data.phCarbon ?? "",
        conductividad:
          data.carbonActivado?.conductividad ??
          data.conductividadCarbon ??
          "",
        dureza:
          data.carbonActivado?.dureza ??
          data.durezaCarbon ??
          "",
        silice:
          data.carbonActivado?.silice ??
          data.siliceCarbon ??
          "",
        tds:
          data.carbonActivado?.tds ??
          data.tdsCarbon ??
          "",
        alcalinidad:
          data.carbonActivado?.alcalinidad ??
          data.alcalinidadCarbon ??
          "",
      },

      cation: {
        ph: data.cation?.ph ?? data.phCation ?? "",
        dureza: data.cation?.dureza ?? data.durezaCation ?? "",
        acidoSulfurico:
          data.cation?.acidoSulfurico ?? data.acidoSulfurico ?? "",
      },

      anion: {
        ph: data.anion?.ph ?? data.phAnion ?? "",
        conductividad:
          data.anion?.conductividad ?? data.conductividad ?? "",
        silice:
          data.anion?.silice ?? data.siliceAnion ?? "",
        tds:
          data.anion?.tds ?? data.tdsAnion ?? "",
        alcalinidad:
          data.anion?.alcalinidad ?? data.alcalinidadAnion ?? "",
        consumoSoda:
          data.anion?.consumoSoda ?? data.consumoSoda ?? "",
      },

      estadoCation: data.estadoCation ?? "No",
      estadoAnion: data.estadoAnion ?? "No",
      reporteCicoq: data.reporteCicoq ?? "No",
      correoNotificado: data.correoNotificado ?? "No",
      observaciones: data.observaciones ?? "Ninguna",
    });

    return res.status(201).json({
      ok: true,
      data: nuevaRegeneracion,
    });
  } catch (error) {
    console.error("Error creando regeneración:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al crear el registro de regeneración.",
      error: error.message,
    });
  }
};

export const obtenerRegeneracionesResina = async (req, res) => {
  try {
    const rangoDefecto = getRangoMesActualYAnterior();

    const fechaDesde = req.query.fechaDesde || rangoDefecto.fechaDesde;
    const fechaHasta = req.query.fechaHasta || rangoDefecto.fechaHasta;

    const registros = await RegeneracionResina.find({
      fecha: {
        $gte: fechaDesde,
        $lte: fechaHasta,
      },
    }).sort({ fecha: -1, createdAt: -1 });

    return res.json({
      ok: true,
      filtros: {
        fechaDesde,
        fechaHasta,
      },
      total: registros.length,
      data: registros,
    });
  } catch (error) {
    console.error("Error consultando regeneraciones:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al consultar registros de regeneración.",
      error: error.message,
    });
  }
};

export const obtenerRegeneracionResinaPorId = async (req, res) => {
  try {
    const registro = await RegeneracionResina.findById(req.params.id);

    if (!registro) {
      return res.status(404).json({
        ok: false,
        message: "Registro no encontrado.",
      });
    }

    return res.json({
      ok: true,
      data: registro,
    });
  } catch (error) {
    console.error("Error consultando registro:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al consultar el registro.",
      error: error.message,
    });
  }
};