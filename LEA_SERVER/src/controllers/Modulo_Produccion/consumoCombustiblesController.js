import ConsumoCombustibles from "../../models/Modulo_Produccion/ConsumoCombustibles.model.js";
import MaterialCombustible from "../../models/Modulo_Produccion/MaterialCombustibleDetails.model.js";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const CALCULATION_TOLERANCE = 0.000001;

const normalizeDate = (value) => String(value || "").slice(0, 10);
const isValidIsoDate = (value) => ISO_DATE_REGEX.test(String(value || ""));
const toStringSafe = (value) => String(value ?? "").trim();

const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const raw = String(value)
    .trim()
    .replace(/\$/g, "")
    .replace(/COP/gi, "")
    .replace(/\s/g, "");

  if (!raw) return null;

  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;

  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const toNumber = (value) => toNumberOrNull(value) ?? 0;

const roundNumber = (value, decimals = 6) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;

  const factor = 10 ** decimals;
  return Math.round((number + Number.EPSILON) * factor) / factor;
};

const normalizeMaterialName = (value) => {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (raw.includes("madera")) return "Madera";
  if (raw.includes("bagazo")) return "Bagazo";
  return "Carbón";
};

const normalizeActiveFlag = (value) => {
  if (value === false || value === 0) return false;

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return !["false", "0", "no", "inactivo", "inactive", "oculto"].includes(
    normalized
  );
};

const normalizeCarbonValue = (value = {}) => ({
  inicial: toNumberOrNull(value.inicial),
  entrada: toNumberOrNull(value.entrada),
  paladasCV: toNumberOrNull(value.paladasCV),
  paladasCN: toNumberOrNull(value.paladasCN),
  ajuste: toNumberOrNull(value.ajuste),
  consumo: toNumberOrNull(value.consumo ?? value.salida),
  final: toNumberOrNull(value.final),
});

const normalizeCarbons = (carbons = {}) => {
  const normalized = {};

  Object.entries(carbons || {}).forEach(([carbonId, value]) => {
    const key = String(carbonId || "").trim();
    if (!key) return;
    normalized[key] = normalizeCarbonValue(value);
  });

  return normalized;
};

const normalizeTotals = (totales = {}) => ({
  entradas: toNumberOrNull(totales.entradas),
  entradaCarbon: toNumberOrNull(totales.entradaCarbon),
  entradaMadera: toNumberOrNull(totales.entradaMadera),
  entradaBagazo: toNumberOrNull(totales.entradaBagazo),
  ajusteCarbon: toNumberOrNull(totales.ajusteCarbon),
  ajusteMadera: toNumberOrNull(totales.ajusteMadera),
  ajusteBagazo: toNumberOrNull(totales.ajusteBagazo),
  consumo: toNumberOrNull(totales.consumo),
  consumoCarbon: toNumberOrNull(totales.consumoCarbon),
  consumoMadera: toNumberOrNull(totales.consumoMadera),
  consumoBagazo: toNumberOrNull(totales.consumoBagazo),
  finalPatio: toNumberOrNull(totales.finalPatio),
  finalCarbonPatio: toNumberOrNull(totales.finalCarbonPatio),
  finalMaderaPatio: toNumberOrNull(totales.finalMaderaPatio),
  finalBagazoPatio: toNumberOrNull(totales.finalBagazoPatio),
  final: toNumberOrNull(totales.final),
  finalCarbon: toNumberOrNull(totales.finalCarbon),
  finalMadera: toNumberOrNull(totales.finalMadera),
  finalBagazo: toNumberOrNull(totales.finalBagazo),
  tolvas: toNumberOrNull(totales.tolvas),
  tolvaCarbon: toNumberOrNull(totales.tolvaCarbon),
  tolvaMadera: toNumberOrNull(totales.tolvaMadera),
  tolvaBagazo: toNumberOrNull(totales.tolvaBagazo),
  porcentajeCarbon: toNumberOrNull(totales.porcentajeCarbon),
  porcentajeMadera: toNumberOrNull(totales.porcentajeMadera),
  porcentajeBagazo: toNumberOrNull(totales.porcentajeBagazo),
  consumoAcumulado: toNumberOrNull(totales.consumoAcumulado),
  mixPercentByItem:
    totales.mixPercentByItem && typeof totales.mixPercentByItem === "object"
      ? totales.mixPercentByItem
      : {},
});

const normalizePayloadRow = (row = {}) => {
  const fecha = normalizeDate(row.fecha || row.id);

  return {
    fecha,
    id: fecha,
    tolvaPrincipal: toNumberOrNull(row.tolvaPrincipal),
    tolvasAuxiliares: toNumberOrNull(row.tolvasAuxiliares),
    observacion: toStringSafe(row.observacion),
    carbons: normalizeCarbons(row.carbons),
    totales: normalizeTotals(row.totales),
  };
};

const hasUsefulRowData = (row = {}) => {
  if (toNumberOrNull(row.tolvaPrincipal) !== null) return true;
  if (toNumberOrNull(row.tolvasAuxiliares) !== null) return true;
  if (toStringSafe(row.observacion)) return true;

  return Object.values(row.carbons || {}).some((carbon = {}) =>
    [
      carbon.inicial,
      carbon.entrada,
      carbon.paladasCV,
      carbon.paladasCN,
      carbon.ajuste,
      carbon.consumo,
      carbon.final,
    ].some((value) => toNumberOrNull(value) !== null)
  );
};

const normalizeDocumentForResponse = (document) => {
  const plain =
    typeof document?.toObject === "function"
      ? document.toObject({ flattenMaps: true })
      : document;

  return {
    ...plain,
    id: plain?.fecha,
    carbons: plain?.carbons || {},
    totales: plain?.totales || {},
  };
};

const buildDateRangeFilter = ({ desde, hasta }) => {
  const filter = { activo: true };

  if (desde || hasta) {
    filter.fecha = {};
    if (desde) filter.fecha.$gte = desde;
    if (hasta) filter.fecha.$lte = hasta;
  }

  return filter;
};

const getUserName = (req) =>
  req.user?.email ||
  req.user?.name ||
  req.body?.actualizadoPor ||
  req.body?.usuario ||
  "";

const normalizeAppliedIncome = (source = {}) => ({
  registros: toNumber(source.registros),
  viajes: toNumber(source.viajes),
  toneladas: toNumber(source.toneladas),
});

const getMaterialCanonicalId = (material = {}) =>
  String(material.codigo || material.id || material._id || "").trim();

const buildMaterialCatalog = (materials = []) => {
  const byAlias = new Map();
  const canonicalIds = [];

  materials.forEach((material) => {
    const canonicalId = getMaterialCanonicalId(material);
    if (!canonicalId) return;

    const normalized = {
      ...material,
      canonicalId,
      material: normalizeMaterialName(material.material),
      weightCV: toNumber(material.weightCV),
      weightCN: toNumber(material.weightCN),
      initialTon: toNumber(material.initialTon),
      active: normalizeActiveFlag(material.active),
    };

    canonicalIds.push(canonicalId);

    [material.codigo, material.id, material._id, canonicalId]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .forEach((alias) => byAlias.set(alias, normalized));
  });

  return {
    byAlias,
    canonicalIds: Array.from(new Set(canonicalIds)),
  };
};

const canonicalizeCarbons = (carbons = {}, materialCatalog) => {
  const canonical = {};

  Object.entries(carbons || {}).forEach(([rawId, value]) => {
    const sourceId = String(rawId || "").trim();
    if (!sourceId) return;

    const material = materialCatalog.byAlias.get(sourceId);
    const canonicalId = material?.canonicalId || sourceId;

    canonical[canonicalId] = {
      ...(canonical[canonicalId] || {}),
      ...normalizeCarbonValue(value),
    };
  });

  return canonical;
};

const hasLegacyCalculatedFields = (document, materialCatalog) => {
  if (!document) return false;

  const carbons = canonicalizeCarbons(document.carbons || {}, materialCatalog);
  const values = Object.values(carbons);

  if (values.length === 0) return true;

  return values.some(
    (value) =>
      toNumberOrNull(value.consumo) === null ||
      toNumberOrNull(value.final) === null
  );
};

const calculateAccumulatedConsumptionBefore = async (fecha) => {
  const previousRows = await ConsumoCombustibles.find({
    activo: true,
    fecha: { $lt: fecha },
  })
    .sort({ fecha: 1 })
    .lean({ flattenMaps: true });

  return previousRows.reduce((total, row) => {
    const persistedTotal = toNumberOrNull(row.totales?.consumo);

    if (persistedTotal !== null) {
      return total + persistedTotal;
    }

    const rowConsumption = Object.values(row.carbons || {}).reduce(
      (sum, carbon = {}) =>
        sum + toNumber(carbon.consumo),
      0
    );

    return total + rowConsumption;
  }, 0);
};

const buildCalculatedRow = ({
  row,
  materialCatalog,
  previousFinalByCarbon,
  consumoAcumuladoAnterior,
}) => {
  const rawCarbons = canonicalizeCarbons(row.carbons || {}, materialCatalog);
  const ids = Array.from(
    new Set([
      ...Object.keys(rawCarbons),
      ...Object.keys(previousFinalByCarbon),
    ])
  );

  const calculatedCarbons = {};
  const mixPercentByItem = {};

  let totalEntradas = 0;
  let totalEntradaCarbon = 0;
  let totalEntradaMadera = 0;
  let totalEntradaBagazo = 0;

  let totalAjusteCarbon = 0;
  let totalAjusteMadera = 0;
  let totalAjusteBagazo = 0;

  let totalConsumo = 0;
  let totalCarbon = 0;
  let totalMadera = 0;
  let totalBagazo = 0;

  let totalFinalPatio = 0;
  let totalFinalCarbonPatio = 0;
  let totalFinalMaderaPatio = 0;
  let totalFinalBagazoPatio = 0;

  ids.forEach((carbonId) => {
    const material = materialCatalog.byAlias.get(carbonId);
    const source = rawCarbons[carbonId] || {};

    const hasPreviousFinal = Object.prototype.hasOwnProperty.call(
      previousFinalByCarbon,
      carbonId
    );

    const initialFallback =
      toNumberOrNull(source.inicial) ?? toNumber(material?.initialTon);

    const inicial = hasPreviousFinal
      ? toNumber(previousFinalByCarbon[carbonId])
      : initialFallback;

    const entrada = toNumber(source.entrada);
    const paladasCV = toNumber(source.paladasCV);
    const paladasCN = toNumber(source.paladasCN);
    const ajuste = toNumber(source.ajuste);

    const hasWeights = Boolean(material);
    const calculatedSalida =
      paladasCV * toNumber(material?.weightCV) +
      paladasCN * toNumber(material?.weightCN);

    // Si quedó un material histórico sin configuración, se conserva su consumo
    // persistido. Con configuración disponible, siempre se recalcula por paladas.
    const salida = hasWeights
      ? calculatedSalida
      : toNumber(source.consumo);

    const final = inicial + entrada + ajuste - salida;

    const normalizedResult = {
      inicial: roundNumber(inicial),
      entrada: roundNumber(entrada),
      paladasCV: roundNumber(paladasCV),
      paladasCN: roundNumber(paladasCN),
      ajuste: roundNumber(ajuste),
      consumo: roundNumber(salida),
      final: roundNumber(final),
    };

    calculatedCarbons[carbonId] = normalizedResult;
    previousFinalByCarbon[carbonId] = normalizedResult.final;

    const materialType = material?.material || normalizeMaterialName(carbonId);
    const includeInTotals = material?.active !== false;

    // Se conserva la cadena de inventario de materiales históricos, pero los
    // materiales inactivos no se incluyen en los totales visibles, igual que
    // en el componente React.
    if (includeInTotals) {
      totalEntradas += entrada;
      totalConsumo += salida;
      totalFinalPatio += final;

      if (materialType === "Madera") {
        totalEntradaMadera += entrada;
        totalAjusteMadera += ajuste;
        totalMadera += salida;
        totalFinalMaderaPatio += final;
      } else if (materialType === "Bagazo") {
        totalEntradaBagazo += entrada;
        totalAjusteBagazo += ajuste;
        totalBagazo += salida;
        totalFinalBagazoPatio += final;
      } else {
        totalEntradaCarbon += entrada;
        totalAjusteCarbon += ajuste;
        totalCarbon += salida;
        totalFinalCarbonPatio += final;
      }
    }
  });

  const totalMezcla = totalCarbon + totalMadera + totalBagazo;
  const totalTolvas =
    toNumber(row.tolvaPrincipal) + toNumber(row.tolvasAuxiliares);

  const porcentajeCarbon =
    totalMezcla > CALCULATION_TOLERANCE
      ? (totalCarbon / totalMezcla) * 100
      : 0;
  const porcentajeMadera =
    totalMezcla > CALCULATION_TOLERANCE
      ? (totalMadera / totalMezcla) * 100
      : 0;
  const porcentajeBagazo =
    totalMezcla > CALCULATION_TOLERANCE
      ? (totalBagazo / totalMezcla) * 100
      : 0;

  const tolvaCarbon =
    totalMezcla > CALCULATION_TOLERANCE
      ? totalTolvas * (totalCarbon / totalMezcla)
      : 0;
  const tolvaMadera =
    totalMezcla > CALCULATION_TOLERANCE
      ? totalTolvas * (totalMadera / totalMezcla)
      : 0;
  const tolvaBagazo =
    totalMezcla > CALCULATION_TOLERANCE
      ? totalTolvas * (totalBagazo / totalMezcla)
      : 0;

  Object.entries(calculatedCarbons).forEach(([carbonId, result]) => {
    const material = materialCatalog.byAlias.get(carbonId);
    const includeInTotals = material?.active !== false;

    mixPercentByItem[carbonId] =
      includeInTotals && totalMezcla > CALCULATION_TOLERANCE
        ? roundNumber((toNumber(result.consumo) / totalMezcla) * 100)
        : 0;
  });

  const totalFinalCarbon = totalFinalCarbonPatio + tolvaCarbon;
  const totalFinalMadera = totalFinalMaderaPatio + tolvaMadera;
  const totalFinalBagazo = totalFinalBagazoPatio + tolvaBagazo;
  const totalFinal =
    totalFinalPatio + tolvaCarbon + tolvaMadera + tolvaBagazo;
  const consumoAcumulado = consumoAcumuladoAnterior + totalConsumo;

  return {
    row: {
      fecha: row.fecha,
      id: row.fecha,
      tolvaPrincipal: toNumberOrNull(row.tolvaPrincipal),
      tolvasAuxiliares: toNumberOrNull(row.tolvasAuxiliares),
      observacion: toStringSafe(row.observacion),
      carbons: calculatedCarbons,
      totales: {
        entradas: roundNumber(totalEntradas),
        entradaCarbon: roundNumber(totalEntradaCarbon),
        entradaMadera: roundNumber(totalEntradaMadera),
        entradaBagazo: roundNumber(totalEntradaBagazo),
        ajusteCarbon: roundNumber(totalAjusteCarbon),
        ajusteMadera: roundNumber(totalAjusteMadera),
        ajusteBagazo: roundNumber(totalAjusteBagazo),
        consumo: roundNumber(totalConsumo),
        consumoCarbon: roundNumber(totalCarbon),
        consumoMadera: roundNumber(totalMadera),
        consumoBagazo: roundNumber(totalBagazo),
        finalPatio: roundNumber(totalFinalPatio),
        finalCarbonPatio: roundNumber(totalFinalCarbonPatio),
        finalMaderaPatio: roundNumber(totalFinalMaderaPatio),
        finalBagazoPatio: roundNumber(totalFinalBagazoPatio),
        final: roundNumber(totalFinal),
        finalCarbon: roundNumber(totalFinalCarbon),
        finalMadera: roundNumber(totalFinalMadera),
        finalBagazo: roundNumber(totalFinalBagazo),
        tolvas: roundNumber(totalTolvas),
        tolvaCarbon: roundNumber(tolvaCarbon),
        tolvaMadera: roundNumber(tolvaMadera),
        tolvaBagazo: roundNumber(tolvaBagazo),
        porcentajeCarbon: roundNumber(porcentajeCarbon),
        porcentajeMadera: roundNumber(porcentajeMadera),
        porcentajeBagazo: roundNumber(porcentajeBagazo),
        consumoAcumulado: roundNumber(consumoAcumulado),
        mixPercentByItem,
      },
    },
    consumoAcumulado,
  };
};

const recalculateAndPersistForward = async ({
  requestedStartDate,
  actualizadoPor,
}) => {
  let recalcularDesde = normalizeDate(requestedStartDate);

  if (!isValidIsoDate(recalcularDesde)) {
    return {
      recalcularDesde: "",
      recalcularHasta: "",
      recalculados: 0,
    };
  }

  const materials = await MaterialCombustible.find({}).lean();
  const materialCatalog = buildMaterialCatalog(materials);

  let previousRecord = await ConsumoCombustibles.findOne({
    activo: true,
    fecha: { $lt: recalcularDesde },
  })
    .sort({ fecha: -1 })
    .lean({ flattenMaps: true });

  // Los documentos históricos no contienen consumo/final. En la primera
  // ejecución se reconstruye toda la cadena desde el registro más antiguo.
  if (previousRecord && hasLegacyCalculatedFields(previousRecord, materialCatalog)) {
    const firstActive = await ConsumoCombustibles.findOne({ activo: true })
      .sort({ fecha: 1 })
      .select({ fecha: 1 })
      .lean();

    if (firstActive?.fecha) {
      recalcularDesde = firstActive.fecha;
      previousRecord = null;
    }
  }

  const rowsToRecalculate = await ConsumoCombustibles.find({
    activo: true,
    fecha: { $gte: recalcularDesde },
  })
    .sort({ fecha: 1 })
    .lean({ flattenMaps: true });

  if (rowsToRecalculate.length === 0) {
    return {
      recalcularDesde,
      recalcularHasta: recalcularDesde,
      recalculados: 0,
    };
  }

  const previousFinalByCarbon = {};

  if (previousRecord) {
    const previousCarbons = canonicalizeCarbons(
      previousRecord.carbons || {},
      materialCatalog
    );

    Object.entries(previousCarbons).forEach(([carbonId, value]) => {
      const final = toNumberOrNull(value.final);
      if (final !== null) previousFinalByCarbon[carbonId] = final;
    });
  }

  let consumoAcumulado = await calculateAccumulatedConsumptionBefore(
    recalcularDesde
  );

  const recalculatedRows = rowsToRecalculate.map((row) => {
    const result = buildCalculatedRow({
      row,
      materialCatalog,
      previousFinalByCarbon,
      consumoAcumuladoAnterior: consumoAcumulado,
    });

    consumoAcumulado = result.consumoAcumulado;
    return result.row;
  });

  const operations = recalculatedRows.map((row) => ({
    updateOne: {
      filter: { fecha: row.fecha },
      update: {
        $set: {
          tolvaPrincipal: row.tolvaPrincipal,
          tolvasAuxiliares: row.tolvasAuxiliares,
          observacion: row.observacion,
          carbons: row.carbons,
          totales: row.totales,
          activo: true,
          actualizadoPor,
        },
      },
    },
  }));

  await ConsumoCombustibles.bulkWrite(operations, { ordered: true });

  return {
    recalcularDesde,
    recalcularHasta: recalculatedRows.at(-1)?.fecha || recalcularDesde,
    recalculados: recalculatedRows.length,
  };
};

const persistInputRows = async ({
  rows,
  actualizadoPor,
  ingresosCombustiblesAplicados,
}) => {
  if (!rows.length) return;

  const fechas = rows.map((row) => row.fecha);
  const existingRows = await ConsumoCombustibles.find({
    fecha: { $in: fechas },
  }).lean({ flattenMaps: true });

  const existingByDate = existingRows.reduce((acc, row) => {
    acc[row.fecha] = row;
    return acc;
  }, {});

  const operations = rows.map((row) => {
    const existing = existingByDate[row.fecha] || {};

    // Se reemplazan las celdas enviadas por la tabla, pero se conservan
    // materiales históricos que ya no estén activos o visibles en el frontend.
    const mergedCarbons = {
      ...(existing.carbons || {}),
      ...(row.carbons || {}),
    };

    return {
      updateOne: {
        filter: { fecha: row.fecha },
        update: {
          $set: {
            fecha: row.fecha,
            tolvaPrincipal: row.tolvaPrincipal,
            tolvasAuxiliares: row.tolvasAuxiliares,
            observacion: row.observacion,
            carbons: mergedCarbons,
            totales: row.totales,
            ingresosCombustiblesAplicados,
            activo: true,
            actualizadoPor,
          },
          $setOnInsert: { creadoPor: actualizadoPor },
        },
        upsert: true,
      },
    };
  });

  await ConsumoCombustibles.bulkWrite(operations, { ordered: true });
};

const persistRowsAndRecalculate = async ({
  rows,
  actualizadoPor,
  ingresosCombustiblesAplicados,
}) => {
  const uniqueRows = new Map();

  rows.forEach((row) => {
    if (!isValidIsoDate(row.fecha)) return;
    if (!hasUsefulRowData(row)) return;
    uniqueRows.set(row.fecha, row);
  });

  const normalizedRows = Array.from(uniqueRows.values()).sort((a, b) =>
    a.fecha.localeCompare(b.fecha)
  );

  if (normalizedRows.length === 0) {
    return {
      guardados: 0,
      recalcularDesde: "",
      recalcularHasta: "",
      recalculados: 0,
    };
  }

  await persistInputRows({
    rows: normalizedRows,
    actualizadoPor,
    ingresosCombustiblesAplicados,
  });

  const recalculation = await recalculateAndPersistForward({
    requestedStartDate: normalizedRows[0].fecha,
    actualizadoPor,
  });

  return {
    guardados: normalizedRows.length,
    ...recalculation,
  };
};

export const getConsumosCombustiblesByRange = async (req, res) => {
  try {
    const desde = normalizeDate(req.query.desde);
    const hasta = normalizeDate(req.query.hasta);

    if (!desde || !hasta) {
      return res.status(400).json({
        ok: false,
        message: "Debes enviar las fechas desde y hasta en formato yyyy-mm-dd.",
      });
    }

    if (!isValidIsoDate(desde) || !isValidIsoDate(hasta)) {
      return res.status(400).json({
        ok: false,
        message: "Formato de fecha inválido. Usa yyyy-mm-dd.",
      });
    }

    if (desde > hasta) {
      return res.status(400).json({
        ok: false,
        message: "La fecha desde no puede ser mayor que la fecha hasta.",
      });
    }

    const registros = await ConsumoCombustibles.find(
      buildDateRangeFilter({ desde, hasta })
    )
      .sort({ fecha: 1 })
      .lean({ virtuals: true, flattenMaps: true });

    return res.json({
      ok: true,
      message: "Consumos de combustibles consultados correctamente.",
      rango: { desde, hasta },
      registros: registros.map(normalizeDocumentForResponse),
    });
  } catch (error) {
    console.error("Error consultando consumos combustibles:", error);
    return res.status(500).json({
      ok: false,
      message: "Error consultando consumos de combustibles.",
      error: error.message,
    });
  }
};

export const getConsumoCombustibleByFecha = async (req, res) => {
  try {
    const fecha = normalizeDate(req.params.fecha);

    if (!isValidIsoDate(fecha)) {
      return res.status(400).json({
        ok: false,
        message: "Fecha inválida. Usa yyyy-mm-dd.",
      });
    }

    const registro = await ConsumoCombustibles.findOne({ fecha, activo: true });

    if (!registro) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró registro para la fecha indicada.",
      });
    }

    return res.json({
      ok: true,
      registro: normalizeDocumentForResponse(registro),
    });
  } catch (error) {
    console.error("Error consultando consumo por fecha:", error);
    return res.status(500).json({
      ok: false,
      message: "Error consultando consumo por fecha.",
      error: error.message,
    });
  }
};

export const saveConsumoCombustibleByFecha = async (req, res) => {
  try {
    const fecha = normalizeDate(req.params.fecha || req.body.fecha);

    if (!isValidIsoDate(fecha)) {
      return res.status(400).json({
        ok: false,
        message: "Fecha inválida. Usa yyyy-mm-dd.",
      });
    }

    const row = normalizePayloadRow({ ...req.body, fecha });
    const actualizadoPor = getUserName(req);
    const ingresosCombustiblesAplicados = normalizeAppliedIncome(
      req.body.ingresosCombustiblesAplicados
    );

    const result = await persistRowsAndRecalculate({
      rows: [row],
      actualizadoPor,
      ingresosCombustiblesAplicados,
    });

    const registro = await ConsumoCombustibles.findOne({ fecha, activo: true });

    return res.json({
      ok: true,
      message:
        "Registro guardado y cadena de inventarios recalculada correctamente.",
      ...result,
      registro: normalizeDocumentForResponse(registro),
    });
  } catch (error) {
    console.error("Error guardando consumo por fecha:", error);
    return res.status(500).json({
      ok: false,
      message: "Error guardando consumo por fecha.",
      error: error.message,
    });
  }
};

export const saveConsumosCombustiblesRange = async (req, res) => {
  try {
    const desde = normalizeDate(req.body.rango?.desde || req.body.desde);
    const hasta = normalizeDate(req.body.rango?.hasta || req.body.hasta);

    if (!desde || !hasta) {
      return res.status(400).json({
        ok: false,
        message: "Debes enviar rango.desde y rango.hasta en formato yyyy-mm-dd.",
      });
    }

    if (!isValidIsoDate(desde) || !isValidIsoDate(hasta)) {
      return res.status(400).json({
        ok: false,
        message: "Formato de fecha inválido. Usa yyyy-mm-dd.",
      });
    }

    if (desde > hasta) {
      return res.status(400).json({
        ok: false,
        message: "La fecha desde no puede ser mayor que la fecha hasta.",
      });
    }

    const sourceRows = Array.isArray(req.body.rows)
      ? req.body.rows
      : Array.isArray(req.body.visibleRows)
        ? req.body.visibleRows
        : [];

    const rowsByFecha = new Map();

    sourceRows.map(normalizePayloadRow).forEach((row) => {
      if (!isValidIsoDate(row.fecha)) return;
      if (row.fecha < desde || row.fecha > hasta) return;
      if (!hasUsefulRowData(row)) return;
      rowsByFecha.set(row.fecha, row);
    });

    const actualizadoPor = getUserName(req);
    const ingresosCombustiblesAplicados = normalizeAppliedIncome(
      req.body.ingresosCombustiblesAplicados
    );

    const result = await persistRowsAndRecalculate({
      rows: Array.from(rowsByFecha.values()),
      actualizadoPor,
      ingresosCombustiblesAplicados,
    });

    const registros = await ConsumoCombustibles.find(
      buildDateRangeFilter({ desde, hasta })
    )
      .sort({ fecha: 1 })
      .lean({ virtuals: true, flattenMaps: true });

    return res.json({
      ok: true,
      message:
        result.recalculados > 0
          ? `Se guardaron ${result.guardados} fila(s) y se recalcularon ${result.recalculados} fecha(s) desde ${result.recalcularDesde} hasta ${result.recalcularHasta}.`
          : "No había filas válidas para guardar o recalcular.",
      rango: { desde, hasta },
      ...result,
      registros: registros.map(normalizeDocumentForResponse),
    });
  } catch (error) {
    console.error("Error guardando consumos combustibles por rango:", error);
    return res.status(500).json({
      ok: false,
      message: "Error guardando consumos de combustibles.",
      error: error.message,
    });
  }
};

export const deleteConsumoCombustibleByFecha = async (req, res) => {
  try {
    const fecha = normalizeDate(req.params.fecha);

    if (!isValidIsoDate(fecha)) {
      return res.status(400).json({
        ok: false,
        message: "Fecha inválida. Usa yyyy-mm-dd.",
      });
    }

    const actualizadoPor = getUserName(req);

    const registro = await ConsumoCombustibles.findOneAndUpdate(
      { fecha, activo: true },
      { $set: { activo: false, actualizadoPor } },
      { new: true }
    );

    if (!registro) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró registro activo para eliminar.",
      });
    }

    const nextRecord = await ConsumoCombustibles.findOne({
      activo: true,
      fecha: { $gt: fecha },
    })
      .sort({ fecha: 1 })
      .select({ fecha: 1 })
      .lean();

    const recalculation = nextRecord?.fecha
      ? await recalculateAndPersistForward({
          requestedStartDate: nextRecord.fecha,
          actualizadoPor,
        })
      : {
          recalcularDesde: "",
          recalcularHasta: "",
          recalculados: 0,
        };

    return res.json({
      ok: true,
      message:
        recalculation.recalculados > 0
          ? `Registro eliminado y ${recalculation.recalculados} fecha(s) posteriores recalculadas.`
          : "Registro eliminado correctamente.",
      ...recalculation,
      registro: normalizeDocumentForResponse(registro),
    });
  } catch (error) {
    console.error("Error eliminando consumo por fecha:", error);
    return res.status(500).json({
      ok: false,
      message: "Error eliminando consumo por fecha.",
      error: error.message,
    });
  }
};

export const getResumenConsumosCombustiblesParaBitacora = async (req, res) => {
  try {
    const fecha = normalizeDate(req.params.fecha);

    if (!isValidIsoDate(fecha)) {
      return res.status(400).json({
        ok: false,
        message: "Fecha inválida. Usa yyyy-mm-dd.",
      });
    }

    const [registro, materiales] = await Promise.all([
      ConsumoCombustibles.findOne({ fecha, activo: true }).lean({
        virtuals: true,
        flattenMaps: true,
      }),
      MaterialCombustible.find({ active: { $ne: false } })
        .sort({ material: 1, name: 1 })
        .lean(),
    ]);

    if (!registro) {
      return res.status(200).json({
        ok: true,
        exists: false,
        message:
          "No se encontraron consumos de combustibles para la fecha consultada.",
        data: {
          fecha,
          resumen: {
            carbon: { consumoTon: 0, ajusteTon: 0, paladasCV: 0, paladasCN: 0 },
            madera: { consumoTon: 0, ajusteTon: 0, paladasCV: 0, paladasCN: 0 },
            bagazo: { consumoTon: 0, ajusteTon: 0, paladasCV: 0, paladasCN: 0 },
            total: { consumoTon: 0, ajusteTon: 0, paladasCV: 0, paladasCN: 0 },
          },
          materiales: [],
          tolvas: { principal: 0, auxiliares: 0, total: 0 },
          observacion: "",
        },
      });
    }

    const resumenPorMaterial = {
      Carbón: { consumoTon: 0, ajusteTon: 0, paladasCV: 0, paladasCN: 0 },
      Madera: { consumoTon: 0, ajusteTon: 0, paladasCV: 0, paladasCN: 0 },
      Bagazo: { consumoTon: 0, ajusteTon: 0, paladasCV: 0, paladasCN: 0 },
    };

    const carbons = registro.carbons || {};

    const detalleMateriales = materiales.map((materialItem) => {
      const materialId = getMaterialCanonicalId(materialItem);
      const movimiento =
        carbons[materialId] || carbons[String(materialItem._id || "")] || {};
      const material = normalizeMaterialName(materialItem.material);
      const paladasCV = toNumber(movimiento.paladasCV);
      const paladasCN = toNumber(movimiento.paladasCN);
      const weightCV = toNumber(materialItem.weightCV);
      const weightCN = toNumber(materialItem.weightCN);
      const ajusteTon = toNumber(movimiento.ajuste);
      const consumoCalculado = paladasCV * weightCV + paladasCN * weightCN;
      const consumoTon =
        toNumberOrNull(movimiento.consumo) ?? consumoCalculado;
      const finalTon =
        toNumberOrNull(movimiento.final) ??
        toNumber(movimiento.inicial) +
          toNumber(movimiento.entrada) +
          ajusteTon -
          consumoTon;

      resumenPorMaterial[material].consumoTon += consumoTon;
      resumenPorMaterial[material].ajusteTon += ajusteTon;
      resumenPorMaterial[material].paladasCV += paladasCV;
      resumenPorMaterial[material].paladasCN += paladasCN;

      return {
        id: materialId,
        material,
        proveedor: materialItem.name || materialItem.nombre || "Material sin nombre",
        weightCV: roundNumber(weightCV),
        weightCN: roundNumber(weightCN),
        paladasCV: roundNumber(paladasCV, 2),
        paladasCN: roundNumber(paladasCN, 2),
        consumoTon: roundNumber(consumoTon, 4),
        ajusteTon: roundNumber(ajusteTon, 4),
        inicialTon: roundNumber(toNumber(movimiento.inicial), 4),
        entradaTon: roundNumber(toNumber(movimiento.entrada), 4),
        finalEstimadoTon: roundNumber(finalTon, 4),
      };
    });

    const materialesConMovimiento = detalleMateriales.filter(
      (item) =>
        item.paladasCV !== 0 ||
        item.paladasCN !== 0 ||
        item.consumoTon !== 0 ||
        item.ajusteTon !== 0 ||
        item.entradaTon !== 0 ||
        item.inicialTon !== 0 ||
        item.finalEstimadoTon !== 0
    );

    const total = {
      consumoTon:
        resumenPorMaterial.Carbón.consumoTon +
        resumenPorMaterial.Madera.consumoTon +
        resumenPorMaterial.Bagazo.consumoTon,
      ajusteTon:
        resumenPorMaterial.Carbón.ajusteTon +
        resumenPorMaterial.Madera.ajusteTon +
        resumenPorMaterial.Bagazo.ajusteTon,
      paladasCV:
        resumenPorMaterial.Carbón.paladasCV +
        resumenPorMaterial.Madera.paladasCV +
        resumenPorMaterial.Bagazo.paladasCV,
      paladasCN:
        resumenPorMaterial.Carbón.paladasCN +
        resumenPorMaterial.Madera.paladasCN +
        resumenPorMaterial.Bagazo.paladasCN,
    };

    const mapResumen = (item) => ({
      consumoTon: roundNumber(item.consumoTon, 4),
      ajusteTon: roundNumber(item.ajusteTon, 4),
      paladasCV: roundNumber(item.paladasCV, 2),
      paladasCN: roundNumber(item.paladasCN, 2),
    });

    const tolvaPrincipal = toNumber(registro.tolvaPrincipal);
    const tolvasAuxiliares = toNumber(registro.tolvasAuxiliares);

    return res.status(200).json({
      ok: true,
      exists: true,
      message:
        "Resumen de consumos de combustibles consultado correctamente para la bitácora.",
      data: {
        fecha,
        resumen: {
          carbon: mapResumen(resumenPorMaterial.Carbón),
          madera: mapResumen(resumenPorMaterial.Madera),
          bagazo: mapResumen(resumenPorMaterial.Bagazo),
          total: mapResumen(total),
        },
        materiales: materialesConMovimiento,
        tolvas: {
          principal: roundNumber(tolvaPrincipal, 4),
          auxiliares: roundNumber(tolvasAuxiliares, 4),
          total: roundNumber(tolvaPrincipal + tolvasAuxiliares, 4),
        },
        observacion: registro.observacion || "",
      },
    });
  } catch (error) {
    console.error("Error consultando resumen de consumos para bitácora:", error);
    return res.status(500).json({
      ok: false,
      message:
        "Error consultando el resumen de consumos de combustibles para la bitácora.",
      error: error.message,
    });
  }
};
