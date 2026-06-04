import RiceItem from "../../models/RICE/RiceItem.model.js";


const DEFAULT_USER = "Sistema";

const calculateRice = (item = {}) => {
  const alcance = Number(item.alcance) || 0;
  const impacto = Number(item.impacto) || 0;
  const confianza = Number(item.confianza) || 0;
  const esfuerzo = Number(item.esfuerzo) || 1;

  return Number(((alcance * impacto * confianza) / esfuerzo).toFixed(2));
};

const normalizeValue = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return value;
};

const createHistoryEntry = ({
  tipo,
  titulo,
  descripcion = "",
  cambios = [],
  usuario = DEFAULT_USER,
}) => ({
  tipo,
  titulo,
  descripcion,
  cambios,
  usuario,
  fecha: new Date(),
});

const buildCreateHistory = (item, usuario = DEFAULT_USER) => {
  return createHistoryEntry({
    tipo: "Creación",
    titulo: "Ítem creado",
    descripcion: "El ítem fue creado y agregado al backlog RICE.",
    usuario,
    cambios: [
      {
        campo: "Estado inicial",
        anterior: "",
        nuevo: item.estado,
      },
      {
        campo: "Puntaje RICE inicial",
        anterior: "",
        nuevo: item.riceScore,
      },
    ],
  });
};

const buildUpdateHistory = (previousItem, nextItem, usuario = DEFAULT_USER) => {
  const fields = [
    { key: "titulo", label: "Título" },
    { key: "descripcion", label: "Descripción" },
    { key: "tipoActividad", label: "Tipo de actividad" },
    { key: "carril", label: "Carril" },
    { key: "areaSolicitante", label: "Área solicitante" },
    { key: "solicitadoPor", label: "Solicitado por" },
    { key: "estado", label: "Estado" },
    { key: "sprint", label: "Sprint" },
    { key: "alcance", label: "R — Alcance" },
    { key: "impacto", label: "I — Impacto" },
    { key: "confianza", label: "C — Confianza" },
    { key: "esfuerzo", label: "E — Esfuerzo" },
    { key: "vetoGerencia", label: "Veto Gerencia General" },
    { key: "notasSeguimiento", label: "Notas de seguimiento" },
  ];

  const cambios = fields
    .filter(({ key }) => {
      return (
        String(normalizeValue(previousItem[key])) !==
        String(normalizeValue(nextItem[key]))
      );
    })
    .map(({ key, label }) => ({
      campo: label,
      anterior: normalizeValue(previousItem[key]),
      nuevo: normalizeValue(nextItem[key]),
    }));

  if (Number(previousItem.riceScore) !== Number(nextItem.riceScore)) {
    cambios.push({
      campo: "Puntaje RICE",
      anterior: previousItem.riceScore,
      nuevo: nextItem.riceScore,
    });
  }

  if (cambios.length === 0) return null;

  const cambioEstado = previousItem.estado !== nextItem.estado;
  const cambioRice =
    Number(previousItem.riceScore) !== Number(nextItem.riceScore);

  let tipo = "Actualización";
  let titulo = "Ítem actualizado";

  if (cambioEstado) {
    tipo = "Cambio de estado";
    titulo = `Estado cambiado de ${previousItem.estado} a ${nextItem.estado}`;
  } else if (cambioRice) {
    tipo = "Cambio RICE";
    titulo = `Puntaje RICE actualizado de ${previousItem.riceScore} a ${nextItem.riceScore}`;
  }

  return createHistoryEntry({
    tipo,
    titulo,
    descripcion: "Se registraron cambios en el ítem.",
    cambios,
    usuario,
  });
};

const buildPayloadRice = (body = {}, previousItem = {}) => {
  const payload = {
    titulo: body.titulo ?? previousItem.titulo,
    descripcion: body.descripcion ?? previousItem.descripcion ?? "",

    tipoActividad:
      body.tipoActividad ?? previousItem.tipoActividad ?? "Requerimiento",

    carril: body.carril ?? previousItem.carril ?? "Carril 1 — Operativo",

    areaSolicitante:
      body.areaSolicitante ??
      previousItem.areaSolicitante ??
      "Gerencia Operaciones",

    solicitadoPor: body.solicitadoPor ?? previousItem.solicitadoPor ?? "",

    alcance:
      body.alcance !== undefined
        ? Number(body.alcance)
        : Number(previousItem.alcance ?? 1),

    impacto:
      body.impacto !== undefined
        ? Number(body.impacto)
        : Number(previousItem.impacto ?? 1),

    confianza:
      body.confianza !== undefined
        ? Number(body.confianza)
        : Number(previousItem.confianza ?? 0.7),

    esfuerzo:
      body.esfuerzo !== undefined
        ? Number(body.esfuerzo)
        : Number(previousItem.esfuerzo ?? 1),

    estado: body.estado ?? previousItem.estado ?? "Backlog",

    sprint: body.sprint ?? previousItem.sprint ?? "",

    vetoGerencia:
      body.vetoGerencia !== undefined
        ? Boolean(body.vetoGerencia)
        : Boolean(previousItem.vetoGerencia ?? false),

    notasSeguimiento:
      body.notasSeguimiento ?? previousItem.notasSeguimiento ?? "",
  };

  payload.riceScore = calculateRice(payload);

  return payload;
};

const getRangoMesActualYAnterior = ({ year, month } = {}) => {
  const now = new Date();

  const selectedYear = Number(year) || now.getFullYear();
  const selectedMonth = Number(month) || now.getMonth() + 1;

  const inicioMesActual = new Date(selectedYear, selectedMonth - 1, 1);
  const finMesActual = new Date(selectedYear, selectedMonth, 1);

  const inicioMesAnterior = new Date(selectedYear, selectedMonth - 2, 1);
  const finMesAnterior = inicioMesActual;

  return {
    mesActual: {
      start: inicioMesActual,
      end: finMesActual,
      year: inicioMesActual.getFullYear(),
      month: inicioMesActual.getMonth() + 1,
    },
    mesAnterior: {
      start: inicioMesAnterior,
      end: finMesAnterior,
      year: inicioMesAnterior.getFullYear(),
      month: inicioMesAnterior.getMonth() + 1,
    },
  };
};

/* ============================================================
   CREAR ÍTEM RICE
============================================================ */

export const createRiceItem = async (req, res) => {
  try {
    const usuario = req.body.usuario || DEFAULT_USER;

    const payload = buildPayloadRice(req.body);

    if (!payload.titulo || !payload.titulo.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El título del ítem es obligatorio.",
      });
    }

    const data = await RiceItem.create({
      ...payload,
      historial: [buildCreateHistory(payload, usuario)],
    });

    return res.status(201).json({
      ok: true,
      message: "Ítem RICE creado correctamente.",
      id: data._id,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al crear el ítem RICE.",
    });
  }
};

/* ============================================================
   CONSULTAR TODOS LOS ÍTEMS ACTIVOS
============================================================ */

export const getAllRiceItems = async (req, res) => {
  try {
    const {
      search = "",
      estado = "",
      carril = "",
      tipoActividad = "",
    } = req.query;

    const filtrosMongo = {
      deletedAt: null,
    };

    if (estado) filtrosMongo.estado = estado;
    if (carril) filtrosMongo.carril = carril;
    if (tipoActividad) filtrosMongo.tipoActividad = tipoActividad;

    if (search.trim()) {
      filtrosMongo.$or = [
        { titulo: { $regex: search, $options: "i" } },
        { descripcion: { $regex: search, $options: "i" } },
        { solicitadoPor: { $regex: search, $options: "i" } },
        { areaSolicitante: { $regex: search, $options: "i" } },
        { estado: { $regex: search, $options: "i" } },
        { carril: { $regex: search, $options: "i" } },
        { tipoActividad: { $regex: search, $options: "i" } },
      ];
    }

    const data = await RiceItem.find(filtrosMongo).sort({
      riceScore: -1,
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
      message: error.message || "Error al listar ítems RICE.",
    });
  }
};

/* ============================================================
   CONSULTAR ÍTEM POR ID
============================================================ */

export const getRiceItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await RiceItem.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!data) {
      return res.status(404).json({
        ok: false,
        message: "Ítem RICE no encontrado.",
      });
    }

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al consultar el ítem RICE.",
    });
  }
};

/* ============================================================
   ACTUALIZAR ÍTEM RICE CON HISTORIAL
============================================================ */

export const updateRiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.body.usuario || DEFAULT_USER;

    const previousData = await RiceItem.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!previousData) {
      return res.status(404).json({
        ok: false,
        message: "Ítem RICE no encontrado.",
      });
    }

    const previousObject = previousData.toObject();

    const nextPayload = buildPayloadRice(req.body, previousObject);

    if (!nextPayload.titulo || !nextPayload.titulo.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El título del ítem es obligatorio.",
      });
    }

    const nextObject = {
      ...previousObject,
      ...nextPayload,
    };

    const historyEntry = buildUpdateHistory(
      previousObject,
      nextObject,
      usuario
    );

    const historialActualizado = historyEntry
      ? [...(previousObject.historial || []), historyEntry]
      : previousObject.historial || [];

    const data = await RiceItem.findByIdAndUpdate(
      id,
      {
        ...nextPayload,
        historial: historialActualizado,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.json({
      ok: true,
      message: historyEntry
        ? "Ítem RICE actualizado correctamente."
        : "No se detectaron cambios en el ítem.",
      id: data._id,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al actualizar el ítem RICE.",
    });
  }
};

/* ============================================================
   ELIMINAR LÓGICO
============================================================ */

export const deleteRiceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.body.usuario || DEFAULT_USER;

    const previousData = await RiceItem.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!previousData) {
      return res.status(404).json({
        ok: false,
        message: "Ítem RICE no encontrado.",
      });
    }

    const historyEntry = createHistoryEntry({
      tipo: "Actualización",
      titulo: "Ítem eliminado",
      descripcion: "El ítem fue eliminado de forma lógica.",
      usuario,
      cambios: [
        {
          campo: "Eliminado",
          anterior: "No",
          nuevo: "Sí",
        },
      ],
    });

    const data = await RiceItem.findByIdAndUpdate(
      id,
      {
        deletedAt: new Date(),
        deletedBy: usuario,
        historial: [...(previousData.historial || []), historyEntry],
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.json({
      ok: true,
      message: "Ítem RICE eliminado correctamente.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al eliminar el ítem RICE.",
    });
  }
};

/* ============================================================
   CONSULTAR HISTORIAL
============================================================ */

export const getRiceHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await RiceItem.findById(id).select("titulo historial");

    if (!data) {
      return res.status(404).json({
        ok: false,
        message: "Ítem RICE no encontrado.",
      });
    }

    const historial = [...(data.historial || [])].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

    return res.json({
      ok: true,
      data: {
        id: data._id,
        titulo: data.titulo,
        historial,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al consultar historial RICE.",
    });
  }
};

/* ============================================================
   DASHBOARD RICE
============================================================ */

export const getRiceDashboard = async (req, res) => {
  try {
    const data = await RiceItem.find({
      deletedAt: null,
    });

    const total = data.length;
    const backlog = data.filter((item) => item.estado === "Backlog").length;
    const enSprint = data.filter((item) => item.estado === "En sprint").length;
    const completados = data.filter(
      (item) => item.estado === "Completado"
    ).length;
    const vetoGerencia = data.filter((item) => item.vetoGerencia).length;

    const mayorRiceItem = [...data].sort(
      (a, b) => Number(b.riceScore) - Number(a.riceScore)
    )[0];

    return res.json({
      ok: true,
      stats: {
        total,
        backlog,
        enSprint,
        completados,
        vetoGerencia,
        mayorRice: mayorRiceItem ? mayorRiceItem.riceScore : 0,
        mayorRiceTitulo: mayorRiceItem?.titulo || "Sin ítems",
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Error al consultar dashboard RICE.",
    });
  }
};

/* ============================================================
   CONSULTA MES ACTUAL Y MES ANTERIOR POR DEFECTO
============================================================ */

export const getRiceItemsMesActualYAnterior = async (req, res) => {
  try {
    const { year, month } = req.query;

    const { mesActual, mesAnterior } = getRangoMesActualYAnterior({
      year,
      month,
    });

    const buildPeriodo = async (periodo) => {
      const creados = await RiceItem.find({
        deletedAt: null,
        createdAt: {
          $gte: periodo.start,
          $lt: periodo.end,
        },
      }).sort({ createdAt: -1 });

      const conMovimientos = await RiceItem.find({
        deletedAt: null,
        "historial.fecha": {
          $gte: periodo.start,
          $lt: periodo.end,
        },
      }).sort({ updatedAt: -1 });

      const movidos = conMovimientos.map((item) => {
        const movimientosPeriodo = (item.historial || []).filter((event) => {
          const fecha = new Date(event.fecha);
          return fecha >= periodo.start && fecha < periodo.end;
        });

        return {
          ...item.toObject(),
          movimientosPeriodo,
        };
      });

      return {
        period: periodo,
        creados,
        movidos,
        stats: {
          creados: creados.length,
          movimientos: movidos.reduce(
            (acc, item) => acc + Number(item.movimientosPeriodo?.length || 0),
            0
          ),
          vetoGerencia: [...creados, ...movidos].filter(
            (item) => item.vetoGerencia
          ).length,
        },
      };
    };

    const actual = await buildPeriodo(mesActual);
    const anterior = await buildPeriodo(mesAnterior);

    return res.json({
      ok: true,
      actual,
      anterior,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message:
        error.message ||
        "Error al consultar información del mes actual y anterior.",
    });
  }
};