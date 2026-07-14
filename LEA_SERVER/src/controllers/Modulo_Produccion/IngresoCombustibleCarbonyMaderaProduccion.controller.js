import mongoose from "mongoose";
import IngresoCombustible from "../../models/Modulo_Produccion/IngresoCombustibleCarbonyMaderaProduccion.model.js";

const pad2 = (value) => String(value).padStart(2, "0");

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const handleError = (res, error) => {
  console.error("Error ingresos combustibles:", error);

  return res.status(error.statusCode || 500).json({
    ok: false,
    message: error.message || "Error interno del servidor.",
  });
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  const raw = String(value)
    .replace(/\$/g, "")
    .replace(/COP/gi, "")
    .replace(/\s/g, "")
    .trim();

  if (!raw) return 0;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  let normalized = raw;

  if (hasComma) {
    normalized = raw.replace(/\./g, "").replace(",", ".");
  } else if (hasDot) {
    const dotCount = (raw.match(/\./g) || []).length;
    const parts = raw.split(".");
    const lastPart = parts.at(-1) || "";

    if (dotCount > 1 || lastPart.length === 3) {
      normalized = raw.replace(/\./g, "");
    }
  }

  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const roundNumber = (
  value,
  decimals = 4
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  const factor = 10 ** decimals;

  return (
    Math.round(
      (number + Number.EPSILON) *
      factor
    ) / factor
  );
};

const excelSerialToIsoDate = (value) => {
  const serial = Number(value);

  if (!Number.isFinite(serial) || serial < 1) {
    throw createError(400, "La fecha numérica recibida no es válida.");
  }

  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const date = new Date(utcValue * 1000);

  if (Number.isNaN(date.getTime())) {
    throw createError(400, "La fecha numérica recibida no se pudo convertir.");
  }

  return date.toISOString().slice(0, 10);
};

const normalizarFechaString = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const raw = String(value || "").trim();

  if (!raw) {
    throw createError(400, "La fecha de recepción es obligatoria.");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d+(\.\d+)?$/.test(raw)) {
    return excelSerialToIsoDate(raw);
  }

  const dmyMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);

  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const normalizedYear = year.length === 2 ? `20${year}` : year;

    return `${normalizedYear}-${pad2(month)}-${pad2(day)}`;
  }

  const ymdMatch = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);

  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;

    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  throw createError(
    400,
    `La fecha "${raw}" no es válida. Debe enviarse como YYYY-MM-DD.`
  );
};

const validarFechaIso = (value, fieldName = "fecha") => {
  const fecha = normalizarFechaString(value);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw createError(400, `${fieldName} debe tener formato YYYY-MM-DD.`);
  }

  return fecha;
};

const normalizarTipoCombustible = (value) => {
  const raw = String(value || "").trim().toLowerCase();

  if (raw.includes("madera")) return "Madera";
  return "Carbón";
};

const normalizarEstadoSap = (value) => {
  const raw = String(value || "").trim();

  if (["", "Pendiente", "Reportado", "No aplica"].includes(raw)) {
    return raw;
  }

  const lower = raw.toLowerCase();

  if (lower.includes("pend")) return "Pendiente";
  if (lower.includes("report")) return "Reportado";
  if (lower.includes("no aplica")) return "No aplica";

  return "";
};

const calcularCampos = (payload) => {
  const pesoMinaKg = toNumber(payload.pesoMinaKg);
  const pesoKgAmbiocom = toNumber(payload.pesoKgAmbiocom);
  const precioUnitarioTon = toNumber(payload.precioUnitarioTon);
  const iva = toNumber(payload.iva);
  const notaDebitoCredito = toNumber(payload.notaDebitoCredito);

  const diferenciaKg = pesoKgAmbiocom - pesoMinaKg;
  const pesoTonRecibidas = pesoKgAmbiocom / 1000;
  const precioTotal = pesoTonRecibidas * precioUnitarioTon;
  const valorFacturado = precioTotal + iva + notaDebitoCredito;

  return {
    ...payload,
    pesoMinaKg,
    pesoKgAmbiocom,
    precioUnitarioTon,
    iva,
    notaDebitoCredito,
    diferenciaKg,
    pesoTonRecibidas,
    precioTotal,
    valorFacturado,
  };
};

const isEmptyRow = (row = {}) => {
  const fields = [
    "fechaRecepcion",
    "mina",
    "remision",
    "numeroFactura",
    "pesoMinaKg",
    "pesoKgAmbiocom",
    "precioUnitarioTon",
    "iva",
    "notaDebitoCredito",
    "reportadoSap",
    "observacion",
  ];

  return fields.every((field) => !String(row[field] ?? "").trim());
};

const normalizarPayload = (row = {}) => {
  const frontendId = String(row.frontendId || row.id || "").trim();

  const payload = {
    frontendId: frontendId || undefined,
    fechaRecepcion: validarFechaIso(row.fechaRecepcion, "fechaRecepcion"),
    mina: String(row.mina || "").trim(),
    remision: String(row.remision || "").trim(),
    numeroFactura: String(row.numeroFactura || "").trim(),
    pesoMinaKg: toNumber(row.pesoMinaKg),
    tipoCombustible: normalizarTipoCombustible(row.tipoCombustible),
    pesoKgAmbiocom: toNumber(row.pesoKgAmbiocom),
    precioUnitarioTon: toNumber(row.precioUnitarioTon),
    iva: toNumber(row.iva),
    notaDebitoCredito: toNumber(row.notaDebitoCredito),
    reportadoSap: normalizarEstadoSap(row.reportadoSap),
    observacion: String(row.observacion || "").trim(),
    activo: true,
  };

  return calcularCampos(payload);
};

const mapDocumento = (doc) => {
  const plain = doc.toObject ? doc.toObject() : doc;

  return {
    ...plain,
    _id: String(plain._id),
    id: plain.frontendId || String(plain._id),
  };
};

const getTodayPartsBogota = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date()).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
};

const getRangoMesActualYAnterior = () => {
  const { year, month } = getTodayPartsBogota();

  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;

  const lastDayCurrentMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    desde: `${previousYear}-${pad2(previousMonth)}-01`,
    hasta: `${year}-${pad2(month)}-${pad2(lastDayCurrentMonth)}`,
  };
};

const consultarPorRango = async ({ desde, hasta }) => {
  const registros = await IngresoCombustible.find({
    activo: true,
    fechaRecepcion: {
      $gte: desde,
      $lte: hasta,
    },
  })
    .sort({
      fechaRecepcion: 1,
      createdAt: 1,
    })
    .lean();

  return registros.map(mapDocumento);
};

export const getIngresosCombustiblesDefault = async (req, res) => {
  try {
    const rango = getRangoMesActualYAnterior();

    const registros = await consultarPorRango(rango);

    return res.status(200).json({
      ok: true,
      message: "Registros de combustible consultados correctamente.",
      rango,
      registros,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getIngresosCombustiblesPorRango = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    const fechaDesde = validarFechaIso(desde, "desde");
    const fechaHasta = validarFechaIso(hasta, "hasta");

    if (fechaDesde > fechaHasta) {
      throw createError(400, "La fecha desde no puede ser mayor que la fecha hasta.");
    }

    const registros = await consultarPorRango({
      desde: fechaDesde,
      hasta: fechaHasta,
    });

    return res.status(200).json({
      ok: true,
      message: "Registros de combustible consultados por rango correctamente.",
      rango: {
        desde: fechaDesde,
        hasta: fechaHasta,
      },
      registros,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const postIngresoCombustible = async (req, res) => {
  try {
    const payload = normalizarPayload(req.body);

    const registro = await IngresoCombustible.create(payload);

    return res.status(201).json({
      ok: true,
      message: "Registro de combustible creado correctamente.",
      registro: mapDocumento(registro),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const putIngresoCombustible = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, "El ID del registro no es válido.");
    }

    const registro = await IngresoCombustible.findOne({
      _id: id,
      activo: true,
    });

    if (!registro) {
      throw createError(404, "No se encontró el registro de combustible.");
    }

    const merged = {
      ...registro.toObject(),
      ...req.body,
      frontendId: req.body.frontendId || req.body.id || registro.frontendId,
    };

    const payload = normalizarPayload(merged);

    Object.assign(registro, payload);

    await registro.save();

    return res.status(200).json({
      ok: true,
      message: "Registro de combustible actualizado correctamente.",
      registro: mapDocumento(registro),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const putIngresosCombustiblesBulk = async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : req.body.rows;

    if (!Array.isArray(rows)) {
      throw createError(400, "Debe enviar un arreglo de registros.");
    }

    const cleanRows = rows.filter((row) => !isEmptyRow(row));

    if (cleanRows.length === 0) {
      return res.status(200).json({
        ok: true,
        message: "No se recibieron filas con información para guardar.",
        resultado: {
          recibidos: rows.length,
          procesados: 0,
          insertados: 0,
          actualizados: 0,
          upserts: 0,
        },
      });
    }

    const operations = cleanRows.map((row) => {
      const payload = normalizarPayload(row);

      const mongoId = row._id || row.mongoId;

      if (mongoId && mongoose.Types.ObjectId.isValid(mongoId)) {
        return {
          updateOne: {
            filter: {
              _id: mongoId,
              activo: true,
            },
            update: {
              $set: payload,
            },
            upsert: false,
          },
        };
      }

      if (payload.frontendId) {
        return {
          updateOne: {
            filter: {
              frontendId: payload.frontendId,
            },
            update: {
              $set: payload,
            },
            upsert: true,
          },
        };
      }

      return {
        insertOne: {
          document: payload,
        },
      };
    });

    const result = await IngresoCombustible.bulkWrite(operations, {
      ordered: false,
    });

    return res.status(200).json({
      ok: true,
      message: "Registros de combustible guardados correctamente.",
      resultado: {
        recibidos: rows.length,
        procesados: cleanRows.length,
        insertados: result.insertedCount || 0,
        actualizados: result.modifiedCount || 0,
        upserts: result.upsertedCount || 0,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteIngresoCombustible = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, "El ID del registro no es válido.");
    }

    const registro = await IngresoCombustible.findOneAndUpdate(
      {
        _id: id,
        activo: true,
      },
      {
        $set: {
          activo: false,
        },
      },
      {
        new: true,
      }
    );

    if (!registro) {
      throw createError(404, "No se encontró el registro de combustible.");
    }

    return res.status(200).json({
      ok: true,
      message: "Registro de combustible eliminado correctamente.",
      resultado: {
        eliminado: true,
        id: String(registro._id),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getResumenIngresosCombustiblesParaBitacora = async (
  req,
  res
) => {
  try {
    const fecha = validarFechaIso(
      req.params?.fecha,
      "fecha"
    );

    const registros =
      await IngresoCombustible.find({
        activo: true,
        fechaRecepcion: fecha,
      })
        .sort({
          fechaRecepcion: 1,
          createdAt: 1,
        })
        .lean();

    const resumenBase = {
      Carbón: {
        toneladas: 0,
        viajes: 0,
      },
      Madera: {
        toneladas: 0,
        viajes: 0,
      },
    };

    const proveedoresMap = new Map();

    const detalle = registros.map((registro) => {
      const tipoCombustible =
        normalizarTipoCombustible(
          registro.tipoCombustible
        );

      const toneladas =
        Number.isFinite(
          Number(registro.pesoTonRecibidas)
        )
          ? Number(registro.pesoTonRecibidas)
          : toNumber(
            registro.pesoKgAmbiocom
          ) / 1000;

      const proveedor =
        String(
          registro.mina ||
          "Proveedor no definido"
        ).trim();

      resumenBase[tipoCombustible].toneladas +=
        toneladas;

      resumenBase[tipoCombustible].viajes += 1;

      const proveedorKey =
        `${tipoCombustible}__${proveedor}`.toLowerCase();

      const proveedorActual =
        proveedoresMap.get(proveedorKey) || {
          material: tipoCombustible,
          proveedor,
          toneladas: 0,
          viajes: 0,
        };

      proveedorActual.toneladas += toneladas;
      proveedorActual.viajes += 1;

      proveedoresMap.set(
        proveedorKey,
        proveedorActual
      );

      return {
        id: String(registro._id),
        fechaRecepcion:
          registro.fechaRecepcion,
        material: tipoCombustible,
        proveedor,
        toneladas,
        pesoKgAmbiocom:
          toNumber(
            registro.pesoKgAmbiocom
          ),
        pesoMinaKg:
          toNumber(registro.pesoMinaKg),
        diferenciaKg:
          toNumber(registro.diferenciaKg),
        remision:
          registro.remision || "",
        numeroFactura:
          registro.numeroFactura || "",
        reportadoSap:
          registro.reportadoSap || "",
        observacion:
          registro.observacion || "",
      };
    });

    const resumenTotal = {
      toneladas:
        resumenBase.Carbón.toneladas +
        resumenBase.Madera.toneladas,
      viajes:
        resumenBase.Carbón.viajes +
        resumenBase.Madera.viajes,
    };

    const proveedores = Array.from(
      proveedoresMap.values()
    )
      .map((item) => ({
        ...item,
        toneladas: roundNumber(
          item.toneladas,
          4
        ),
      }))
      .sort((a, b) => {
        const materialCompare =
          a.material.localeCompare(
            b.material,
            "es"
          );

        if (materialCompare !== 0) {
          return materialCompare;
        }

        return a.proveedor.localeCompare(
          b.proveedor,
          "es"
        );
      });

    return res.status(200).json({
      ok: true,
      exists: registros.length > 0,
      message: registros.length
        ? "Resumen de ingresos de combustibles consultado correctamente para la bitácora."
        : "No se encontraron ingresos de combustibles para la fecha consultada.",
      data: {
        fecha,

        resumen: {
          carbon: {
            toneladas: roundNumber(
              resumenBase.Carbón.toneladas,
              4
            ),
            viajes:
              resumenBase.Carbón.viajes,
          },

          madera: {
            toneladas: roundNumber(
              resumenBase.Madera.toneladas,
              4
            ),
            viajes:
              resumenBase.Madera.viajes,
          },

          total: {
            toneladas: roundNumber(
              resumenTotal.toneladas,
              4
            ),
            viajes:
              resumenTotal.viajes,
          },
        },

        proveedores,
        detalle,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};