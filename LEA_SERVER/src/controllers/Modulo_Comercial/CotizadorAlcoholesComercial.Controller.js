import CotizacionAlcohol from "../../models/Modulo_Comercial/CotizadorAlcoholesComercial.model.js";

const ESTADOS_PERMITIDOS = ["enviada", "negociacion", "ganada", "perdida"];

const normalizarTexto = (value) => String(value ?? "").trim();

const normalizarNumero = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const normalizarPayloadCotizacion = (body = {}) => {
  return {
    fecha: body.fecha ? new Date(body.fecha) : new Date(),

    comercial: normalizarTexto(body.comercial).toLowerCase(),
    cliente: normalizarTexto(body.cliente),
    estado: normalizarTexto(body.estado || "enviada").toLowerCase(),

    producto: normalizarTexto(body.producto),
    sector: normalizarTexto(body.sector),
    origen: normalizarTexto(body.origen),
    ciudad: normalizarTexto(body.ciudad),

    rutaFleteId: normalizarTexto(body.rutaFleteId),
    rutaFlete: body.rutaFlete || null,

    tipo: normalizarTexto(body.tipo),

    volPed: normalizarNumero(body.volPed),
    volMen: normalizarNumero(body.volMen),
    trm: normalizarNumero(body.trm),
    pv: normalizarNumero(body.pv),
    pe: normalizarNumero(body.pe),
    peCOP: normalizarNumero(body.peCOP),

    margenObjetivo: normalizarNumero(body.margenObjetivo),
    costoTotalUSD: normalizarNumero(body.costoTotalUSD),
    fleteCOP: normalizarNumero(body.fleteCOP),
    fleteUSD: normalizarNumero(body.fleteUSD),
    recipUSD: normalizarNumero(body.recipUSD),
    util: normalizarNumero(body.util),
    margen: normalizarNumero(body.margen),

    recipData: body.recipData || null,
  };
};

export const crearCotizacionAlcohol = async (req, res) => {
  try {
    const payload = normalizarPayloadCotizacion(req.body);

    if (!payload.comercial) {
      return res.status(400).json({
        ok: false,
        message: "El comercial es obligatorio.",
      });
    }

    if (!payload.cliente) {
      return res.status(400).json({
        ok: false,
        message: "El cliente es obligatorio.",
      });
    }

    if (!ESTADOS_PERMITIDOS.includes(payload.estado)) {
      return res.status(400).json({
        ok: false,
        message: "Estado no válido.",
      });
    }

    const usuario =
      req.user?.email ||
      req.user?.usuario ||
      req.user?.nombre ||
      req.body.creadoPor ||
      "";

    const nuevaCotizacion = await CotizacionAlcohol.create({
      ...payload,
      creadoPor: usuario,
      actualizadoPor: usuario,
      historialEstados: [
        {
          estadoAnterior: "",
          estadoNuevo: payload.estado,
          usuario,
          fecha: new Date(),
        },
      ],
    });

    return res.status(201).json({
      ok: true,
      message: "Cotización creada correctamente.",
      data: nuevaCotizacion,
    });
  } catch (error) {
    console.error("Error creando cotización:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al crear la cotización.",
      error: error.message,
    });
  }
};

export const listarCotizacionesAlcohol = async (req, res) => {
  try {
    const {
      comercial,
      estado,
      search,
      activo = "true",
      limit = 200,
      page = 1,
      sort = "-fecha",
    } = req.query;

    const query = {};

    if (activo !== "all") {
      query.activo = activo === "true";
    }

    if (comercial && comercial !== "all") {
      query.comercial = String(comercial).toLowerCase().trim();
    }

    if (estado && estado !== "all") {
      query.estado = String(estado).toLowerCase().trim();
    }

    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), "i");

      query.$or = [
        { cliente: regex },
        { producto: regex },
        { ciudad: regex },
        { comercial: regex },
      ];
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 200, 1), 1000);
    const skip = (pageNumber - 1) * limitNumber;

    const [data, total] = await Promise.all([
      CotizacionAlcohol.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      CotizacionAlcohol.countDocuments(query),
    ]);

    return res.status(200).json({
      ok: true,
      total,
      page: pageNumber,
      limit: limitNumber,
      data,
    });
  } catch (error) {
    console.error("Error listando cotizaciones:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al listar las cotizaciones.",
      error: error.message,
    });
  }
};

export const obtenerCotizacionAlcoholPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cotizacion = await CotizacionAlcohol.findById(id).lean();

    if (!cotizacion) {
      return res.status(404).json({
        ok: false,
        message: "Cotización no encontrada.",
      });
    }

    return res.status(200).json({
      ok: true,
      data: cotizacion,
    });
  } catch (error) {
    console.error("Error obteniendo cotización:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener la cotización.",
      error: error.message,
    });
  }
};

export const actualizarCotizacionAlcohol = async (req, res) => {
  try {
    const { id } = req.params;

    const actual = await CotizacionAlcohol.findById(id);

    if (!actual) {
      return res.status(404).json({
        ok: false,
        message: "Cotización no encontrada.",
      });
    }

    const payload = normalizarPayloadCotizacion({
      ...actual.toObject(),
      ...req.body,
    });

    const usuario =
      req.user?.email ||
      req.user?.usuario ||
      req.user?.nombre ||
      req.body.actualizadoPor ||
      "";

    const estadoAnterior = actual.estado;
    const estadoNuevo = payload.estado;

    actual.set({
      ...payload,
      actualizadoPor: usuario,
    });

    if (estadoNuevo && estadoNuevo !== estadoAnterior) {
      actual.historialEstados.push({
        estadoAnterior,
        estadoNuevo,
        usuario,
        fecha: new Date(),
      });
    }

    await actual.save();

    return res.status(200).json({
      ok: true,
      message: "Cotización actualizada correctamente.",
      data: actual,
    });
  } catch (error) {
    console.error("Error actualizando cotización:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar la cotización.",
      error: error.message,
    });
  }
};

export const cambiarEstadoCotizacionAlcohol = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const nuevoEstado = String(estado || "").toLowerCase().trim();

    if (!ESTADOS_PERMITIDOS.includes(nuevoEstado)) {
      return res.status(400).json({
        ok: false,
        message: "Estado no válido.",
      });
    }

    const cotizacion = await CotizacionAlcohol.findById(id);

    if (!cotizacion) {
      return res.status(404).json({
        ok: false,
        message: "Cotización no encontrada.",
      });
    }

    const estadoAnterior = cotizacion.estado;

    const usuario =
      req.user?.email ||
      req.user?.usuario ||
      req.user?.nombre ||
      req.body.actualizadoPor ||
      "";

    cotizacion.estado = nuevoEstado;
    cotizacion.actualizadoPor = usuario;

    if (estadoAnterior !== nuevoEstado) {
      cotizacion.historialEstados.push({
        estadoAnterior,
        estadoNuevo: nuevoEstado,
        usuario,
        fecha: new Date(),
      });
    }

    await cotizacion.save();

    return res.status(200).json({
      ok: true,
      message: "Estado actualizado correctamente.",
      data: cotizacion,
    });
  } catch (error) {
    console.error("Error cambiando estado:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al cambiar el estado.",
      error: error.message,
    });
  }
};

export const eliminarCotizacionAlcohol = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.query;

    const cotizacion = await CotizacionAlcohol.findById(id);

    if (!cotizacion) {
      return res.status(404).json({
        ok: false,
        message: "Cotización no encontrada.",
      });
    }

    if (String(hardDelete) === "true") {
      await CotizacionAlcohol.findByIdAndDelete(id);

      return res.status(200).json({
        ok: true,
        message: "Cotización eliminada definitivamente.",
      });
    }

    cotizacion.activo = false;
    await cotizacion.save();

    return res.status(200).json({
      ok: true,
      message: "Cotización desactivada correctamente.",
      data: cotizacion,
    });
  } catch (error) {
    console.error("Error eliminando cotización:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al eliminar la cotización.",
      error: error.message,
    });
  }
};

export const resumenCotizacionesAlcohol = async (req, res) => {
  try {
    const { comercial, estado, search } = req.query;

    const match = {
      activo: true,
    };

    if (comercial && comercial !== "all") {
      match.comercial = String(comercial).toLowerCase().trim();
    }

    if (estado && estado !== "all") {
      match.estado = String(estado).toLowerCase().trim();
    }

    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), "i");

      match.$or = [
        { cliente: regex },
        { producto: regex },
        { ciudad: regex },
        { comercial: regex },
      ];
    }

    const [resumen] = await CotizacionAlcohol.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          cotizaciones: { $sum: 1 },
          volumenTotal: { $sum: "$volPed" },
          valorTotalCotizado: {
            $sum: {
              $multiply: ["$pv", "$volPed"],
            },
          },
          ganadoUSD: {
            $sum: {
              $cond: [
                { $eq: ["$estado", "ganada"] },
                { $multiply: ["$pv", "$volPed"] },
                0,
              ],
            },
          },
          margenPromedio: { $avg: "$margen" },
          ganadas: {
            $sum: {
              $cond: [{ $eq: ["$estado", "ganada"] }, 1, 0],
            },
          },
          perdidas: {
            $sum: {
              $cond: [{ $eq: ["$estado", "perdida"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          cotizaciones: 1,
          volumenTotal: 1,
          valorTotalCotizado: 1,
          ganadoUSD: 1,
          margenPromedio: { $ifNull: ["$margenPromedio", 0] },
          ganadas: 1,
          perdidas: 1,
          tasaCierre: {
            $cond: [
              { $gt: [{ $add: ["$ganadas", "$perdidas"] }, 0] },
              {
                $divide: [
                  "$ganadas",
                  { $add: ["$ganadas", "$perdidas"] },
                ],
              },
              null,
            ],
          },
        },
      },
    ]);

    return res.status(200).json({
      ok: true,
      data: resumen || {
        cotizaciones: 0,
        volumenTotal: 0,
        valorTotalCotizado: 0,
        ganadoUSD: 0,
        margenPromedio: 0,
        ganadas: 0,
        perdidas: 0,
        tasaCierre: null,
      },
    });
  } catch (error) {
    console.error("Error generando resumen:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al generar el resumen.",
      error: error.message,
    });
  }
};