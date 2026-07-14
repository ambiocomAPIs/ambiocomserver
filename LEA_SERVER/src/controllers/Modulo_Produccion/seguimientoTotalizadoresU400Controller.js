import SeguimientoTotalizadoresU400 from "../../models/Modulo_Produccion/SeguimientoTotalizadoresU400.model.js";

const MONTHS_ES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Bogota";

const n = (value) => {
  if (value === null || value === undefined || value === "") return null;

  let s = String(value).trim().replace(/\s/g, "");
  if (!s) return null;

  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }

  const number = Number(s);
  return Number.isFinite(number) ? number : null;
};

const round = (value, decimals = 6) => {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  if (!Number.isFinite(number)) return null;

  const factor = 10 ** decimals;
  return Math.round(number * factor) / factor;
};

const safeRatio = (numerator, denominator) => {
  const num = Number(numerator || 0);
  const den = Number(denominator || 0);

  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  return round(num / den, 8);
};

const diff = (row, inicioKey, finalKey) => {
  const inicio = n(row?.[inicioKey]);
  const final = n(row?.[finalKey]);

  if (inicio === null && final === null) return null;

  return round((final ?? 0) - (inicio ?? 0), 6);
};

const validarMes = (mes) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(mes || ""));

const getMesActual = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;

  return `${year}-${month}`;
};

const getInfoMes = (mes) => {
  const [anioText, mesText] = String(mes).split("-");
  const anio = Number(anioText);
  const mesNumero = Number(mesText);
  const ultimoDia = new Date(anio, mesNumero, 0).getDate();
  const mesNombre = MONTHS_ES[mesNumero - 1] || "MES";

  return {
    anio,
    mesNumero,
    registroNombre: `REGISTRO_PRODUCCION_${mesNombre}_${anio}`,
    fechaInicioMes: `${anio}-${String(mesNumero).padStart(2, "0")}-01`,
    fechaFinMes: `${anio}-${String(mesNumero).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`,
  };
};

const getMesAnterior = (mes) => {
  const [anioText, mesText] = String(mes).split("-");
  const fecha = new Date(Number(anioText), Number(mesText) - 2, 1);

  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
};

const getVentanaMeses = (mesPrincipal) => {
  const mesAnterior = getMesAnterior(mesPrincipal);
  const infoAnterior = getInfoMes(mesAnterior);
  const infoPrincipal = getInfoMes(mesPrincipal);

  return {
    mesAnterior,
    mesPrincipal,
    meses: [mesAnterior, mesPrincipal],
    desde: infoAnterior.fechaInicioMes,
    hasta: infoPrincipal.fechaFinMes,
  };
};

const normalizeTurno = (value) => {
  const v = String(value || "").trim();
  if (!v) return "";

  const match = v.match(/^(?:turno\s*)?([1-5])$/i);
  if (match) return `Turno ${match[1]}`;

  return v;
};

const getTurnoNumero = (value) => {
  const turno = normalizeTurno(value);
  const match = turno.match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

const isTurno12Horas = (value) => {
  const turno = normalizeTurno(value);
  return turno === "Turno 4" || turno === "Turno 5";
};

const getUserFromReq = (req) =>
  req.user?._id ||
  req.usuario?._id ||
  req.user?.id ||
  req.usuario?.id ||
  req.user?.email ||
  req.usuario?.email ||
  null;

const emptyTotals = () => ({
  renConsumo: null,
  prodTotal: null,
  tk402Total: null,
  renNivelTotal: null,
  ab801Total: null,

  difProdTraslado: null,
  errorTrasladoPct: null,
  difProdTk402: null,
  errorProdTk402Pct: null,

  difRenNiveles: null,
  errorRenNivelesPct: null,

  difAcumRenProd: null,
  errorTotalizadoresPct: null,

  fcPorTotalizador: null,
  fcRenNiveles: null,
});

const buildRegistroBase = (mes) => {
  const info = getInfoMes(mes);

  return {
    registroNombre: info.registroNombre,
    mes,
    anio: info.anio,
    mesNumero: info.mesNumero,
    fechaInicioMes: info.fechaInicioMes,
    fechaFinMes: info.fechaFinMes,
    factor402: 9620,
    factor801: 139982,
    rows: [],
    rowsNormalizadas: [],
    rowsActivas: [],
    dias: [],
    resumenTurnos: {
      filasEstructurales: 0,
      filasActivas: 0,
      dias8Horas: 0,
      dias12Horas: 0,
    },
    totals: emptyTotals(),
    estado: "BORRADOR",
  };
};

const tieneDatoOperativo = (row = {}) => {
  const keys = [
    "turno",
    "renInicio",
    "renFinal",
    "prodInicio",
    "prodFinal",
    "tk402AInicio",
    "tk402AFinal",
    "tk402BInicio",
    "tk402BFinal",
    "tanque1",
    "factor1",
    "nivel1Inicio",
    "nivel1Final",
    "tanque2",
    "factor2",
    "nivel2Inicio",
    "nivel2Final",
    "ab801Inicio",
    "ab801Final",
  ];

  return keys.some((key) => {
    const value = row?.[key];
    return value !== null && value !== undefined && String(value).trim() !== "";
  });
};

const calcularTurno = ({ row, factor402, factor801, fechaDefault, modalidadTurno, posicionTurnoDia }) => {
  const fecha = String(row?.fecha || fechaDefault || "").trim();
  const turno = normalizeTurno(row?.turno);
  const turnoNumero = getTurnoNumero(turno);

  const renConsumo = diff(row, "renInicio", "renFinal");
  const prodTotal = diff(row, "prodInicio", "prodFinal");

  const tk402ADiff = diff(row, "tk402AInicio", "tk402AFinal");
  const tk402BDiff = diff(row, "tk402BInicio", "tk402BFinal");

  const tk402Total =
    tk402ADiff === null && tk402BDiff === null
      ? null
      : round(((tk402ADiff || 0) + (tk402BDiff || 0)) * factor402, 6);

  const f1 = n(row?.factor1);
  const i1 = n(row?.nivel1Inicio);
  const e1 = n(row?.nivel1Final);

  const f2 = n(row?.factor2);
  const i2 = n(row?.nivel2Inicio);
  const e2 = n(row?.nivel2Final);

  const totalNivel1 = f1 !== null && i1 !== null && e1 !== null ? (i1 - e1) * f1 : null;
  const totalNivel2 = f2 !== null && i2 !== null && e2 !== null ? (i2 - e2) * f2 : null;

  const renNivelTotal =
    totalNivel1 === null && totalNivel2 === null
      ? null
      : round((totalNivel1 || 0) + (totalNivel2 || 0), 6);

  const ab801Diff = diff(row, "ab801Inicio", "ab801Final");
  const ab801Total = ab801Diff === null ? null : round(ab801Diff * factor801, 6);

  const difProdTk402 =
    prodTotal === null && tk402Total === null
      ? null
      : round(Number(prodTotal || 0) - Number(tk402Total || 0), 6);

  const errorProdTk402Pct =
    difProdTk402 === null
      ? null
      : safeRatio(Math.abs(difProdTk402), Math.abs(Number(prodTotal || 0)));

  const difRenNiveles =
    renConsumo === null && renNivelTotal === null
      ? null
      : round(Number(renConsumo || 0) - Number(renNivelTotal || 0), 6);

  const errorRenNivelesPct =
    difRenNiveles === null
      ? null
      : safeRatio(Math.abs(difRenNiveles), Math.abs(Number(renConsumo || 0)));

  const difAcumRenProd =
    renConsumo === null && prodTotal === null
      ? null
      : round(Math.abs(Number(prodTotal || 0) - Number(renConsumo || 0)), 6);

  const errorTotalizadoresPct =
    difAcumRenProd === null
      ? null
      : safeRatio(difAcumRenProd, Number(renConsumo || 0) + Number(prodTotal || 0));

  const fcPorTotalizador =
    prodTotal === null && tk402Total === null
      ? null
      : safeRatio(Number(tk402Total || 0), Number(prodTotal || 0));

  const fcRenNiveles =
    renConsumo === null && renNivelTotal === null
      ? null
      : safeRatio(Number(renNivelTotal || 0), Number(renConsumo || 0));

  return {
    idFrontend: String(row?.id || row?._id || ""),

    fecha,
    turno,
    turnoNumero,
    claveFila: fecha && turnoNumero ? `${fecha}_TURNO_${turnoNumero}` : "",

    modalidadTurno: modalidadTurno || (isTurno12Horas(turno) ? "12H" : "8H"),
    posicionTurnoDia: posicionTurnoDia ?? row?.posicionTurnoDia ?? null,
    activo: row?.activo !== false,

    renInicio: row?.renInicio ?? "",
    renFinal: row?.renFinal ?? "",

    prodInicio: row?.prodInicio ?? "",
    prodFinal: row?.prodFinal ?? "",

    tk402AInicio: row?.tk402AInicio ?? "",
    tk402AFinal: row?.tk402AFinal ?? "",
    tk402BInicio: row?.tk402BInicio ?? "",
    tk402BFinal: row?.tk402BFinal ?? "",

    tanque1: row?.tanque1 ?? "",
    factor1: row?.factor1 ?? "",
    nivel1Inicio: row?.nivel1Inicio ?? "",
    nivel1Final: row?.nivel1Final ?? "",

    tanque2: row?.tanque2 ?? "",
    factor2: row?.factor2 ?? "",
    nivel2Inicio: row?.nivel2Inicio ?? "",
    nivel2Final: row?.nivel2Final ?? "",

    ab801Inicio: row?.ab801Inicio ?? "",
    ab801Final: row?.ab801Final ?? "",

    renConsumo,
    prodTotal,
    tk402Total,
    renNivelTotal,
    ab801Total,

    // Compatibilidad con nombres del frontend actual
    difProdTraslado: difProdTk402,
    errorTrasladoPct: errorProdTk402Pct,

    // Nombres claros para análisis
    difProdTk402,
    errorProdTk402Pct,

    difRenNiveles,
    errorRenNivelesPct,

    difAcumRenProd,
    errorTotalizadoresPct,

    fcPorTotalizador,
    fcRenNiveles,
  };
};

const sumarTurnos = (turnos = []) => {
  const base = {
    renConsumo: 0,
    prodTotal: 0,
    tk402Total: 0,
    renNivelTotal: 0,
    ab801Total: 0,
  };

  let tieneDatos = false;

  turnos.forEach((turno) => {
    Object.keys(base).forEach((key) => {
      const value = turno?.[key];

      if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
        base[key] += Number(value);
        tieneDatos = true;
      }
    });
  });

  if (!tieneDatos) return emptyTotals();

  const difProdTk402 = round(Number(base.prodTotal || 0) - Number(base.tk402Total || 0), 6);
  const difRenNiveles = round(Number(base.renConsumo || 0) - Number(base.renNivelTotal || 0), 6);
  const difAcumRenProd = round(Math.abs(Number(base.prodTotal || 0) - Number(base.renConsumo || 0)), 6);

  return {
    renConsumo: round(base.renConsumo, 6),
    prodTotal: round(base.prodTotal, 6),
    tk402Total: round(base.tk402Total, 6),
    renNivelTotal: round(base.renNivelTotal, 6),
    ab801Total: round(base.ab801Total, 6),

    difProdTraslado: difProdTk402,
    errorTrasladoPct: safeRatio(Math.abs(difProdTk402), Math.abs(Number(base.prodTotal || 0))),

    difProdTk402,
    errorProdTk402Pct: safeRatio(Math.abs(difProdTk402), Math.abs(Number(base.prodTotal || 0))),

    difRenNiveles,
    errorRenNivelesPct: safeRatio(Math.abs(difRenNiveles), Math.abs(Number(base.renConsumo || 0))),

    difAcumRenProd,
    errorTotalizadoresPct: safeRatio(
      difAcumRenProd,
      Number(base.renConsumo || 0) + Number(base.prodTotal || 0)
    ),

    fcPorTotalizador: safeRatio(Number(base.tk402Total || 0), Number(base.prodTotal || 0)),
    fcRenNiveles: safeRatio(Number(base.renNivelTotal || 0), Number(base.renConsumo || 0)),
  };
};

const validarDuplicadosFechaTurno = (dias = []) => {
  const vistos = new Set();

  dias.forEach((dia) => {
    (dia.turnos || []).forEach((turno) => {
      if (!turno.fecha || !turno.turno) return;

      const key = `${turno.fecha}__${turno.turno}`.toUpperCase();

      if (vistos.has(key)) {
        const error = new Error(`Turno duplicado para la misma fecha: ${turno.fecha} / ${turno.turno}`);
        error.statusCode = 400;
        throw error;
      }

      vistos.add(key);
    });
  });
};

const normalizarDias = ({ payload, factor402, factor801 }) => {
  const diasInput = Array.isArray(payload?.dias) ? payload.dias : [];
  const rowsInput = Array.isArray(payload?.rows) ? payload.rows : [];

  const diasFuente = diasInput.length
    ? diasInput
    : rowsInput.reduce((acc, row, index) => {
        const grupo = Math.floor(index / 3);

        if (!acc[grupo]) {
          acc[grupo] = {
            diaGrupo: grupo + 1,
            fecha: row?.fecha || "",
            turnos: [],
          };
        }

        acc[grupo].turnos.push({
          ...row,
          posicionTurnoDia: (index % 3) + 1,
        });

        return acc;
      }, []);

  const dias = diasFuente
    .map((dia, diaIndex) => {
      const turnosRaw = Array.isArray(dia?.turnos) ? dia.turnos : [];
      const fechaDia = String(dia?.fecha || turnosRaw.find((t) => t?.fecha)?.fecha || "").trim();

      const modalidadTurno =
        dia?.modalidadTurno === "12H" || turnosRaw.some((turno) => isTurno12Horas(turno?.turno))
          ? "12H"
          : "8H";

      const turnos = turnosRaw
        .map((turno, index) => ({
          ...turno,
          fecha: turno?.fecha || fechaDia,
          posicionTurnoDia: turno?.posicionTurnoDia ?? index + 1,
        }))
        .filter((turno, index) => {
          if (modalidadTurno === "12H" && (turno.posicionTurnoDia === 3 || index === 2)) {
            return false;
          }

          return tieneDatoOperativo(turno);
        })
        .map((turno) =>
          calcularTurno({
            row: turno,
            factor402,
            factor801,
            fechaDefault: fechaDia,
            modalidadTurno,
            posicionTurnoDia: turno.posicionTurnoDia,
          })
        );

      return {
        diaGrupo: dia?.diaGrupo ?? diaIndex + 1,
        fecha: fechaDia || turnos.find((turno) => turno.fecha)?.fecha || "",
        modalidadTurno,
        turnos,
        totals: sumarTurnos(turnos),
      };
    })
    .filter((dia) => dia.turnos.length > 0);

  validarDuplicadosFechaTurno(dias);

  return dias;
};

const buildDocumento = (payload, req, mesParam = null) => {
  const mes = mesParam || payload?.mes || getMesActual();

  if (!validarMes(mes)) {
    const error = new Error("El campo mes es obligatorio y debe tener formato YYYY-MM, ejemplo: 2026-06");
    error.statusCode = 400;
    throw error;
  }

  const info = getInfoMes(mes);

  const factor402 = n(payload?.factor402) ?? 9620;
  const factor801 = n(payload?.factor801) ?? 139982;

  const dias = normalizarDias({
    payload,
    factor402,
    factor801,
  });

  const turnosMes = dias.flatMap((dia) => dia.turnos || []);
  const totals = sumarTurnos(turnosMes);

  return {
    registroNombre: String(payload?.registroNombre || info.registroNombre).toUpperCase(),
    mes,
    anio: info.anio,
    mesNumero: info.mesNumero,
    fechaInicioMes: payload?.fechaInicioMes || info.fechaInicioMes,
    fechaFinMes: payload?.fechaFinMes || info.fechaFinMes,

    factor402,
    factor801,

    rows: Array.isArray(payload?.rows) ? payload.rows : [],
    rowsNormalizadas: Array.isArray(payload?.rowsNormalizadas) ? payload.rowsNormalizadas : [],
    rowsActivas: turnosMes,

    dias,
    resumenTurnos: {
      filasEstructurales: Array.isArray(payload?.rows) ? payload.rows.length : 0,
      filasActivas: turnosMes.length,
      dias8Horas: dias.filter((dia) => dia.modalidadTurno === "8H").length,
      dias12Horas: dias.filter((dia) => dia.modalidadTurno === "12H").length,
    },

    totals,
    actualizadoPor: getUserFromReq(req),
  };
};

export const obtenerVentanaSeguimientoTotalizadoresU400 = async (req, res) => {
  try {
    const mesPrincipal = req.params?.mes || req.query?.mes || getMesActual();

    if (!validarMes(mesPrincipal)) {
      return res.status(400).json({
        ok: false,
        message: "El mes principal debe tener formato YYYY-MM, ejemplo: 2026-07",
      });
    }

    const ventana = getVentanaMeses(mesPrincipal);

    const registros = await SeguimientoTotalizadoresU400.find({
      mes: { $in: ventana.meses },
    })
      .sort({ mes: 1 })
      .lean();

    const registrosPorMes = new Map(
      registros.map((registro) => [registro.mes, registro])
    );

    const data = ventana.meses.map((mes) => {
      const registro = registrosPorMes.get(mes);

      return {
        mes,
        exists: Boolean(registro),
        data: registro || buildRegistroBase(mes),
      };
    });

    return res.json({
      ok: true,
      mesAnterior: ventana.mesAnterior,
      mesPrincipal: ventana.mesPrincipal,
      desde: ventana.desde,
      hasta: ventana.hasta,
      totalEncontrados: registros.length,
      data,
    });
  } catch (error) {
    console.error("Error consultando ventana de totalizadores U400:", error);

    return res.status(500).json({
      ok: false,
      message: "Error consultando el mes principal y el mes anterior",
      error: error.message,
    });
  }
};

export const autoguardarVentanaSeguimientoTotalizadoresU400 = async (req, res) => {
  try {
    const registrosInput = Array.isArray(req.body?.registros)
      ? req.body.registros
      : [];

    if (!registrosInput.length) {
      return res.status(400).json({
        ok: false,
        message: "Debes enviar al menos un registro dentro de registros.",
      });
    }

    if (registrosInput.length > 2) {
      return res.status(400).json({
        ok: false,
        message: "La ventana solo puede guardar el mes principal y el mes anterior.",
      });
    }

    const mesesRecibidos = registrosInput.map((registro) =>
      String(registro?.mes || "").trim()
    );

    if (mesesRecibidos.some((mes) => !validarMes(mes))) {
      return res.status(400).json({
        ok: false,
        message: "Todos los registros deben incluir un mes válido con formato YYYY-MM.",
      });
    }

    if (new Set(mesesRecibidos).size !== mesesRecibidos.length) {
      return res.status(400).json({
        ok: false,
        message: "No se permite enviar el mismo mes más de una vez.",
      });
    }

    const mesPrincipal = String(
      req.body?.mesPrincipal || [...mesesRecibidos].sort().at(-1)
    );

    if (!validarMes(mesPrincipal)) {
      return res.status(400).json({
        ok: false,
        message: "El mesPrincipal debe tener formato YYYY-MM.",
      });
    }

    const ventana = getVentanaMeses(mesPrincipal);
    const mesesPermitidos = new Set(ventana.meses);

    const mesFueraDeVentana = mesesRecibidos.find(
      (mes) => !mesesPermitidos.has(mes)
    );

    if (mesFueraDeVentana) {
      return res.status(400).json({
        ok: false,
        message: `El mes ${mesFueraDeVentana} no pertenece a la ventana ${ventana.mesAnterior} - ${ventana.mesPrincipal}.`,
      });
    }

    const usuario = getUserFromReq(req);
    const ahora = new Date();

    const documentos = registrosInput.map((payload) =>
      buildDocumento(payload, req, payload.mes)
    );

    // Validación Mongoose previa al bulkWrite para conservar las reglas del modelo.
    await Promise.all(
      documentos.map((documento) =>
        new SeguimientoTotalizadoresU400({
          ...documento,
          estado: "BORRADOR",
          creadoPor: usuario,
          actualizadoPor: usuario,
        }).validate()
      )
    );

    const operaciones = documentos.map((documento) => ({
      updateOne: {
        filter: { mes: documento.mes },
        update: {
          $set: {
            ...documento,
            estado: "BORRADOR",
            actualizadoPor: usuario,
            updatedAt: ahora,
          },
          $setOnInsert: {
            creadoPor: usuario,
            createdAt: ahora,
          },
        },
        upsert: true,
      },
    }));

    const resultado = await SeguimientoTotalizadoresU400.bulkWrite(
      operaciones,
      { ordered: true }
    );

    return res.json({
      ok: true,
      message: `${documentos.length} mes(es) autoguardado(s) correctamente`,
      data: {
        meses: documentos.map((documento) => documento.mes),
        matchedCount: resultado?.matchedCount ?? resultado?.nMatched ?? 0,
        modifiedCount: resultado?.modifiedCount ?? resultado?.nModified ?? 0,
        upsertedCount: resultado?.upsertedCount ?? resultado?.nUpserted ?? 0,
      },
    });
  } catch (error) {
    console.error("Error autoguardando ventana de totalizadores U400:", error);

    return res.status(error.statusCode || 500).json({
      ok: false,
      message:
        error.message ||
        "Error autoguardando el mes principal y el mes anterior",
    });
  }
};

export const obtenerSeguimientoTotalizadoresU400Actual = async (req, res) => {
  try {
    const mes = req.query?.mes || getMesActual();

    if (!validarMes(mes)) {
      return res.status(400).json({
        ok: false,
        message: "El mes debe tener formato YYYY-MM, ejemplo: 2026-06",
      });
    }

    const registro = await SeguimientoTotalizadoresU400.findOne({ mes }).lean();

    if (!registro) {
      return res.json({
        ok: true,
        exists: false,
        message: `No existe registro guardado para el mes ${mes}.`,
        data: buildRegistroBase(mes),
      });
    }

    return res.json({
      ok: true,
      exists: true,
      data: registro,
    });
  } catch (error) {
    console.error("Error consultando totalizadores U400:", error);

    return res.status(500).json({
      ok: false,
      message: "Error consultando registro de totalizadores U400",
      error: error.message,
    });
  }
};

export const obtenerSeguimientoTotalizadoresU400PorMes = async (req, res) => {
  try {
    const { mes } = req.params;

    if (!validarMes(mes)) {
      return res.status(400).json({
        ok: false,
        message: "El mes debe tener formato YYYY-MM, ejemplo: 2026-06",
      });
    }

    const registro = await SeguimientoTotalizadoresU400.findOne({ mes }).lean();

    if (!registro) {
      return res.json({
        ok: true,
        exists: false,
        message: `No existe registro guardado para el mes ${mes}.`,
        data: buildRegistroBase(mes),
      });
    }

    return res.json({
      ok: true,
      exists: true,
      data: registro,
    });
  } catch (error) {
    console.error("Error consultando totalizadores U400 por mes:", error);

    return res.status(500).json({
      ok: false,
      message: "Error consultando registro de totalizadores U400",
      error: error.message,
    });
  }
};

export const listarHistoricoSeguimientosTotalizadoresU400 = async (req, res) => {
  try {
    const { anio, estado, desde, hasta } = req.query;

    const filtro = {};

    if (anio) filtro.anio = Number(anio);
    if (estado) filtro.estado = estado;

    if (desde || hasta) {
      filtro.mes = {};
      if (desde) filtro.mes.$gte = desde;
      if (hasta) filtro.mes.$lte = hasta;
    }

    const registros = await SeguimientoTotalizadoresU400.find(filtro)
      .sort({ mes: -1 })
      .select(
        "registroNombre mes anio mesNumero fechaInicioMes fechaFinMes estado resumenTurnos totals createdAt updatedAt"
      )
      .lean();

    return res.json({
      ok: true,
      total: registros.length,
      data: registros,
    });
  } catch (error) {
    console.error("Error listando histórico totalizadores U400:", error);

    return res.status(500).json({
      ok: false,
      message: "Error listando histórico de totalizadores U400",
      error: error.message,
    });
  }
};

export const autoguardarSeguimientoTotalizadoresU400 = async (req, res) => {
  try {
    const documento = buildDocumento(req.body, req);

    const registro = await SeguimientoTotalizadoresU400.findOneAndUpdate(
      { mes: documento.mes },
      {
        $set: {
          ...documento,
          estado: "BORRADOR",
        },
        $setOnInsert: {
          creadoPor: getUserFromReq(req),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.json({
      ok: true,
      message: "Registro autoguardado correctamente",
      data: registro,
    });
  } catch (error) {
    console.error("Error autoguardando totalizadores U400:", error);

    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error autoguardando registro de totalizadores U400",
    });
  }
};

export const guardarSeguimientoTotalizadoresU400PorMes = async (req, res) => {
  try {
    const { mes } = req.params;

    if (!validarMes(mes)) {
      return res.status(400).json({
        ok: false,
        message: "El mes debe tener formato YYYY-MM, ejemplo: 2026-06",
      });
    }

    const documento = buildDocumento(
      {
        ...req.body,
        mes,
      },
      req,
      mes
    );

    const registro = await SeguimientoTotalizadoresU400.findOneAndUpdate(
      { mes },
      {
        $set: {
          ...documento,
          estado: req.body?.estado || "BORRADOR",
        },
        $setOnInsert: {
          creadoPor: getUserFromReq(req),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.json({
      ok: true,
      message: "Registro guardado correctamente",
      data: registro,
    });
  } catch (error) {
    console.error("Error guardando totalizadores U400:", error);

    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message || "Error guardando registro de totalizadores U400",
    });
  }
};

export const cerrarSeguimientoTotalizadoresU400 = async (req, res) => {
  try {
    const { mes } = req.params;

    if (!validarMes(mes)) {
      return res.status(400).json({
        ok: false,
        message: "El mes debe tener formato YYYY-MM, ejemplo: 2026-06",
      });
    }

    const registro = await SeguimientoTotalizadoresU400.findOneAndUpdate(
      { mes },
      {
        $set: {
          estado: "CERRADO",
          cerradoPor: getUserFromReq(req),
          cerradoEn: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!registro) {
      return res.status(404).json({
        ok: false,
        message: `No existe registro para el mes ${mes}`,
      });
    }

    return res.json({
      ok: true,
      message: "Registro cerrado correctamente",
      data: registro,
    });
  } catch (error) {
    console.error("Error cerrando totalizadores U400:", error);

    return res.status(500).json({
      ok: false,
      message: "Error cerrando registro de totalizadores U400",
      error: error.message,
    });
  }
};

export const eliminarSeguimientoTotalizadoresU400 = async (req, res) => {
  try {
    const { mes } = req.params;

    if (!validarMes(mes)) {
      return res.status(400).json({
        ok: false,
        message: "El mes debe tener formato YYYY-MM, ejemplo: 2026-06",
      });
    }

    const registro = await SeguimientoTotalizadoresU400.findOneAndDelete({ mes });

    if (!registro) {
      return res.status(404).json({
        ok: false,
        message: `No existe registro para el mes ${mes}`,
      });
    }

    return res.json({
      ok: true,
      message: "Registro eliminado correctamente",
      data: registro,
    });
  } catch (error) {
    console.error("Error eliminando totalizadores U400:", error);

    return res.status(500).json({
      ok: false,
      message: "Error eliminando registro de totalizadores U400",
      error: error.message,
    });
  }
};

export const obtenerResumenDiarioTotalizadoresParaBitacora = async (
  req,
  res
) => {
  try {
    const fecha = String(req.params?.fecha || "").trim();

    const fechaValida =
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(fecha);

    if (!fechaValida) {
      return res.status(400).json({
        ok: false,
        message:
          "La fecha es obligatoria y debe tener formato YYYY-MM-DD.",
      });
    }

    const mes = fecha.slice(0, 7);

    const registro =
      await SeguimientoTotalizadoresU400.findOne({ mes }).lean();

    if (!registro) {
      return res.status(404).json({
        ok: false,
        exists: false,
        message: `No existe registro de totalizadores para el mes ${mes}.`,
        data: {
          fecha,
          mes,
          cantidadTurnos: 0,
          turnos: [],
          totals: emptyTotals(),
        },
      });
    }

    const diaGuardado = Array.isArray(registro.dias)
      ? registro.dias.find(
          (dia) => String(dia?.fecha || "").trim() === fecha
        )
      : null;

    let turnos = Array.isArray(diaGuardado?.turnos)
      ? diaGuardado.turnos.filter(
          (turno) => turno?.activo !== false
        )
      : [];

    if (
      !turnos.length &&
      Array.isArray(registro.rowsActivas)
    ) {
      turnos = registro.rowsActivas.filter(
        (turno) =>
          String(turno?.fecha || "").trim() === fecha &&
          turno?.activo !== false
      );
    }

    const tieneTotalesGuardados =
      diaGuardado?.totals &&
      Object.values(diaGuardado.totals).some(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== "" &&
          Number.isFinite(Number(value))
      );

    const totals = tieneTotalesGuardados
      ? diaGuardado.totals
      : sumarTurnos(turnos);

    return res.json({
      ok: true,
      exists: true,
      message:
        "Resumen diario de totalizadores consultado correctamente para la bitácora.",
      data: {
        fecha,
        mes,
        registroNombre: registro.registroNombre || "",
        modalidadTurno:
          diaGuardado?.modalidadTurno ||
          (turnos.some(
            (turno) => turno?.modalidadTurno === "12H"
          )
            ? "12H"
            : "8H"),
        cantidadTurnos: turnos.length,
        turnos,
        totals,
      },
    });
  } catch (error) {
    console.error(
      "Error consultando resumen diario de totalizadores para bitácora:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Error consultando el resumen diario de totalizadores para la bitácora.",
      error: error.message,
    });
  }
};