import ConsumoCombustibles from "../../models/Modulo_Produccion/ConsumoCombustibles.model.js";
import MaterialCombustible from "../../models/Modulo_Produccion/MaterialCombustibleDetails.model.js";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const normalizeDate = (value) => String(value || "").slice(0, 10);

const isValidIsoDate = (value) => ISO_DATE_REGEX.test(String(value || ""));

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

const toStringSafe = (value) => String(value ?? "").trim();

const normalizeCarbonValue = (value = {}) => ({
  inicial: toNumberOrNull(value.inicial),
  entrada: toNumberOrNull(value.entrada),
  paladasCV: toNumberOrNull(value.paladasCV),
  paladasCN: toNumberOrNull(value.paladasCN),
  ajuste: toNumberOrNull(value.ajuste),
});

const normalizeCarbons = (carbons = {}) => {
  const normalized = {};

  Object.entries(carbons || {}).forEach(([carbonId, value]) => {
    if (!carbonId) return;

    normalized[carbonId] = normalizeCarbonValue(value);
  });

  return normalized;
};

const normalizePayloadRow = (row = {}) => {
  const fecha = normalizeDate(row.fecha || row.id);

  return {
    fecha,
    id: fecha,
    tolvaPrincipal: toNumberOrNull(row.tolvaPrincipal),
    tolvasAuxiliares: toNumberOrNull(row.tolvasAuxiliares),
    observacion: toStringSafe(row.observacion),
    carbons: normalizeCarbons(row.carbons),
  };
};

const hasUsefulRowData = (row = {}) => {
  if (toNumberOrNull(row.tolvaPrincipal) !== null) return true;
  if (toNumberOrNull(row.tolvasAuxiliares) !== null) return true;
  if (toStringSafe(row.observacion)) return true;

  return Object.values(row.carbons || {}).some((carbon = {}) => {
    return [
      carbon.inicial,
      carbon.entrada,
      carbon.paladasCV,
      carbon.paladasCN,
      carbon.ajuste,
    ].some((value) => toNumberOrNull(value) !== null);
  });
};

const normalizeDocumentForResponse = (document) => {
  const plain =
    typeof document?.toObject === "function"
      ? document.toObject({ flattenMaps: true })
      : document;

  return {
    ...plain,
    id: plain.fecha,
    carbons: plain.carbons || {},
  };
};

const buildDateRangeFilter = ({ desde, hasta }) => {
  const filter = {
    activo: true,
  };

  if (desde || hasta) {
    filter.fecha = {};

    if (desde) filter.fecha.$gte = desde;
    if (hasta) filter.fecha.$lte = hasta;
  }

  return filter;
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
      .lean({
        virtuals: true,
        flattenMaps: true,
      });

    return res.json({
      ok: true,
      message: "Consumos de combustibles consultados correctamente.",
      rango: {
        desde,
        hasta,
      },
      registros: registros.map((row) => ({
        ...row,
        id: row.fecha,
        carbons: row.carbons || {},
      })),
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

    const registro = await ConsumoCombustibles.findOne({
      fecha,
      activo: true,
    });

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

    const row = normalizePayloadRow({
      ...req.body,
      fecha,
    });

    const actualizadoPor =
      req.user?.email ||
      req.user?.name ||
      req.body.actualizadoPor ||
      req.body.usuario ||
      "";

    const registro = await ConsumoCombustibles.findOneAndUpdate(
      {
        fecha,
      },
      {
        $set: {
          ...row,
          activo: true,
          actualizadoPor,
        },
        $setOnInsert: {
          creadoPor: actualizadoPor,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.json({
      ok: true,
      message: "Registro guardado correctamente.",
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

    sourceRows
      .map(normalizePayloadRow)
      .forEach((row) => {
        if (!isValidIsoDate(row.fecha)) return;
        if (row.fecha < desde || row.fecha > hasta) return;
        if (!hasUsefulRowData(row)) return;

        rowsByFecha.set(row.fecha, row);
      });

    const rows = Array.from(rowsByFecha.values());

    const actualizadoPor =
      req.user?.email ||
      req.user?.name ||
      req.body.actualizadoPor ||
      req.body.usuario ||
      "";

    const ingresosCombustiblesAplicados = {
      registros: toNumberOrNull(
        req.body.ingresosCombustiblesAplicados?.registros
      ) || 0,
      viajes:
        toNumberOrNull(req.body.ingresosCombustiblesAplicados?.viajes) || 0,
      toneladas:
        toNumberOrNull(req.body.ingresosCombustiblesAplicados?.toneladas) || 0,
    };

    const operations = rows.map((row) => ({
      updateOne: {
        filter: {
          fecha: row.fecha,
        },
        update: {
          $set: {
            fecha: row.fecha,
            id: row.fecha,
            tolvaPrincipal: row.tolvaPrincipal,
            tolvasAuxiliares: row.tolvasAuxiliares,
            observacion: row.observacion,
            carbons: row.carbons,
            ingresosCombustiblesAplicados,
            activo: true,
            actualizadoPor,
          },
          $setOnInsert: {
            creadoPor: actualizadoPor,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await ConsumoCombustibles.bulkWrite(operations, {
        ordered: false,
      });
    }

    const registros = await ConsumoCombustibles.find(
      buildDateRangeFilter({ desde, hasta })
    )
      .sort({ fecha: 1 })
      .lean({
        virtuals: true,
        flattenMaps: true,
      });

    return res.json({
      ok: true,
      message: "Consumos de combustibles guardados por fecha correctamente.",
      rango: {
        desde,
        hasta,
      },
      guardados: rows.length,
      registros: registros.map((row) => ({
        ...row,
        id: row.fecha,
        carbons: row.carbons || {},
      })),
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

    const actualizadoPor =
      req.user?.email ||
      req.user?.name ||
      req.body.actualizadoPor ||
      req.body.usuario ||
      "";

    const registro = await ConsumoCombustibles.findOneAndUpdate(
      {
        fecha,
        activo: true,
      },
      {
        $set: {
          activo: false,
          actualizadoPor,
        },
      },
      {
        new: true,
      }
    );

    if (!registro) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró registro activo para eliminar.",
      });
    }

    return res.json({
      ok: true,
      message: "Registro eliminado correctamente.",
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

export const getResumenConsumosCombustiblesParaBitacora = async (
  req,
  res
) => {
  try {
    const fecha = normalizeDate(req.params.fecha);

    if (!isValidIsoDate(fecha)) {
      return res.status(400).json({
        ok: false,
        message: "Fecha inválida. Usa yyyy-mm-dd.",
      });
    }

    const [registro, materiales] = await Promise.all([
      ConsumoCombustibles.findOne({
        fecha,
        activo: true,
      }).lean({
        virtuals: true,
        flattenMaps: true,
      }),

      MaterialCombustible.find({
        active: {
          $ne: false,
        },
      })
        .sort({
          material: 1,
          name: 1,
        })
        .lean(),
    ]);

    /*
     * Aunque no exista registro para la fecha,
     * se devuelve una estructura válida para que
     * el PDF pueda mostrar "sin datos".
     */
    if (!registro) {
      return res.status(200).json({
        ok: true,
        exists: false,
        message:
          "No se encontraron consumos de combustibles para la fecha consultada.",

        data: {
          fecha,

          resumen: {
            carbon: {
              consumoTon: 0,
              ajusteTon: 0,
              paladasCV: 0,
              paladasCN: 0,
            },

            madera: {
              consumoTon: 0,
              ajusteTon: 0,
              paladasCV: 0,
              paladasCN: 0,
            },

            bagazo: {
              consumoTon: 0,
              ajusteTon: 0,
              paladasCV: 0,
              paladasCN: 0,
            },

            total: {
              consumoTon: 0,
              ajusteTon: 0,
              paladasCV: 0,
              paladasCN: 0,
            },
          },

          materiales: [],

          tolvas: {
            principal: 0,
            auxiliares: 0,
            total: 0,
          },

          observacion: "",
        },
      });
    }

    const normalizarMaterial = (value) => {
      const raw = String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (raw.includes("madera")) return "Madera";
      if (raw.includes("bagazo")) return "Bagazo";

      return "Carbón";
    };

    const numero = (value) => {
      const parsed = Number(value);

      return Number.isFinite(parsed)
        ? parsed
        : 0;
    };

    const redondear = (
      value,
      decimals = 4
    ) => {
      const parsed = Number(value);

      if (!Number.isFinite(parsed)) {
        return 0;
      }

      const factor = 10 ** decimals;

      return (
        Math.round(
          (parsed + Number.EPSILON) *
            factor
        ) / factor
      );
    };

    const resumenPorMaterial = {
      Carbón: {
        consumoTon: 0,
        ajusteTon: 0,
        paladasCV: 0,
        paladasCN: 0,
      },

      Madera: {
        consumoTon: 0,
        ajusteTon: 0,
        paladasCV: 0,
        paladasCN: 0,
      },

      Bagazo: {
        consumoTon: 0,
        ajusteTon: 0,
        paladasCV: 0,
        paladasCN: 0,
      },
    };

    const carbons =
      registro.carbons || {};

    const detalleMateriales =
      materiales.map((materialItem) => {
        /*
         * La llave almacenada en carbons normalmente
         * corresponde al código/id del material.
         */
        const materialId = String(
          materialItem.codigo ||
            materialItem.id ||
            materialItem._id ||
            ""
        ).trim();

        /*
         * Se intenta encontrar el movimiento usando
         * diferentes identificadores compatibles.
         */
        const movimiento =
          carbons[materialId] ||
          carbons[
            String(
              materialItem._id || ""
            )
          ] ||
          {};

        const material =
          normalizarMaterial(
            materialItem.material
          );

        const paladasCV = numero(
          movimiento.paladasCV
        );

        const paladasCN = numero(
          movimiento.paladasCN
        );

        const weightCV = numero(
          materialItem.weightCV
        );

        const weightCN = numero(
          materialItem.weightCN
        );

        const ajusteTon = numero(
          movimiento.ajuste
        );

        const consumoTon =
          paladasCV * weightCV +
          paladasCN * weightCN;

        resumenPorMaterial[
          material
        ].consumoTon += consumoTon;

        resumenPorMaterial[
          material
        ].ajusteTon += ajusteTon;

        resumenPorMaterial[
          material
        ].paladasCV += paladasCV;

        resumenPorMaterial[
          material
        ].paladasCN += paladasCN;

        return {
          id: materialId,

          material,

          proveedor:
            materialItem.name ||
            materialItem.nombre ||
            "Material sin nombre",

          weightCV: redondear(
            weightCV,
            6
          ),

          weightCN: redondear(
            weightCN,
            6
          ),

          paladasCV: redondear(
            paladasCV,
            2
          ),

          paladasCN: redondear(
            paladasCN,
            2
          ),

          consumoTon: redondear(
            consumoTon,
            4
          ),

          ajusteTon: redondear(
            ajusteTon,
            4
          ),

          inicialTon: redondear(
            numero(
              movimiento.inicial
            ),
            4
          ),

          entradaTon: redondear(
            numero(
              movimiento.entrada
            ),
            4
          ),

          finalEstimadoTon: redondear(
            numero(
              movimiento.inicial
            ) +
              numero(
                movimiento.entrada
              ) +
              ajusteTon -
              consumoTon,
            4
          ),
        };
      });

    /*
     * Solo se muestran materiales que tuvieron algún dato
     * registrado durante la fecha consultada.
     */
    const materialesConMovimiento =
      detalleMateriales.filter(
        (item) =>
          item.paladasCV !== 0 ||
          item.paladasCN !== 0 ||
          item.consumoTon !== 0 ||
          item.ajusteTon !== 0 ||
          item.entradaTon !== 0 ||
          item.inicialTon !== 0
      );

    const total = {
      consumoTon:
        resumenPorMaterial.Carbón
          .consumoTon +
        resumenPorMaterial.Madera
          .consumoTon +
        resumenPorMaterial.Bagazo
          .consumoTon,

      ajusteTon:
        resumenPorMaterial.Carbón
          .ajusteTon +
        resumenPorMaterial.Madera
          .ajusteTon +
        resumenPorMaterial.Bagazo
          .ajusteTon,

      paladasCV:
        resumenPorMaterial.Carbón
          .paladasCV +
        resumenPorMaterial.Madera
          .paladasCV +
        resumenPorMaterial.Bagazo
          .paladasCV,

      paladasCN:
        resumenPorMaterial.Carbón
          .paladasCN +
        resumenPorMaterial.Madera
          .paladasCN +
        resumenPorMaterial.Bagazo
          .paladasCN,
    };

    const mapResumen = (
      item
    ) => ({
      consumoTon: redondear(
        item.consumoTon,
        4
      ),

      ajusteTon: redondear(
        item.ajusteTon,
        4
      ),

      paladasCV: redondear(
        item.paladasCV,
        2
      ),

      paladasCN: redondear(
        item.paladasCN,
        2
      ),
    });

    const tolvaPrincipal = numero(
      registro.tolvaPrincipal
    );

    const tolvasAuxiliares = numero(
      registro.tolvasAuxiliares
    );

    return res.status(200).json({
      ok: true,
      exists: true,

      message:
        "Resumen de consumos de combustibles consultado correctamente para la bitácora.",

      data: {
        fecha,

        resumen: {
          carbon: mapResumen(
            resumenPorMaterial.Carbón
          ),

          madera: mapResumen(
            resumenPorMaterial.Madera
          ),

          bagazo: mapResumen(
            resumenPorMaterial.Bagazo
          ),

          total: mapResumen(total),
        },

        materiales:
          materialesConMovimiento,

        tolvas: {
          principal: redondear(
            tolvaPrincipal,
            4
          ),

          auxiliares: redondear(
            tolvasAuxiliares,
            4
          ),

          total: redondear(
            tolvaPrincipal +
              tolvasAuxiliares,
            4
          ),
        },

        observacion:
          registro.observacion || "",
      },
    });
  } catch (error) {
    console.error(
      "Error consultando resumen de consumos para bitácora:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Error consultando el resumen de consumos de combustibles para la bitácora.",
      error: error.message,
    });
  }
};