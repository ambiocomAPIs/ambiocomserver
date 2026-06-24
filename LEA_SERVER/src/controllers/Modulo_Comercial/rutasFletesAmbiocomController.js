import RutasFletesAmbiocom, {
  DEFAULT_TRANSPORTADORAS,
  emptyRow,
} from "../../models/Modulo_Comercial/RutasFletesAmbiocom.model.js";

const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const raw = String(value).trim();
  if (!raw || raw === "-" || raw === "–" || raw === "—") return null;

  let clean = raw
    .replace(/\$/g, "")
    .replace(/COP/gi, "")
    .replace(/\s/g, "");

  const commaCount = (clean.match(/,/g) || []).length;
  const dotCount = (clean.match(/\./g) || []).length;

  if (commaCount > 0 && dotCount > 0) {
    if (clean.lastIndexOf(",") > clean.lastIndexOf(".")) {
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else {
      clean = clean.replace(/,/g, "");
    }
  } else if (commaCount > 0) {
    const decimals = clean.split(",").at(-1);
    clean =
      decimals?.length === 3
        ? clean.replace(/,/g, "")
        : clean.replace(",", ".");
  } else if (dotCount > 0) {
    const decimals = clean.split(".").at(-1);
    clean = decimals?.length === 3 ? clean.replace(/\./g, "") : clean;
  }

  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
};

const calcularFletePromedio = (row) => {
  const fletesValidos = (row.fletes ?? [])
    .map(toNumber)
    .filter((value) => value !== null && Number.isFinite(value));

  if (!fletesValidos.length) return null;

  return (
    fletesValidos.reduce((acc, value) => acc + value, 0) / fletesValidos.length
  );
};

const calcularCopL = (row, fletePromedio) => {
  const litros = toNumber(row.cantidadLitros);

  if (!litros || !fletePromedio) return null;

  return fletePromedio / litros;
};

const limpiarRow = (row = {}) => {
  const plainRow = row?.toObject ? row.toObject() : row || {};

  const {
    prioridad,
    transportadora,
    fletePromedio,
    copL,
    __v,
    ...cleanRow
  } = plainRow;

  return cleanRow;
};

const normalizarTransportadoras = (transportadoras = DEFAULT_TRANSPORTADORAS) => {
  if (!Array.isArray(transportadoras) || !transportadoras.length) {
    return DEFAULT_TRANSPORTADORAS;
  }

  const normalizadas = transportadoras
    .map((item) => String(item || "").trim().toUpperCase())
    .filter(Boolean);

  return normalizadas.length
    ? [...new Set(normalizadas)]
    : DEFAULT_TRANSPORTADORAS;
};

const normalizarRows = (rows = [], transportadorasLength = 0) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  if (!safeRows.length) {
    return [emptyRow(transportadorasLength)];
  }

  return safeRows.map((row) => {
    const cleanRow = limpiarRow(row);
    const currentFletes = Array.isArray(cleanRow.fletes) ? cleanRow.fletes : [];

    return {
      ...emptyRow(transportadorasLength),
      ...cleanRow,
      fletes: Array.from(
        { length: transportadorasLength },
        (_, index) => currentFletes[index] ?? ""
      ),
    };
  });
};

const hidratarMatriz = (doc) => {
  if (!doc) return null;

  const plain = doc.toObject ? doc.toObject() : doc;

  const rows = (plain.rows ?? []).map((row) => {
    const cleanRow = limpiarRow(row);
    const fletePromedio = calcularFletePromedio(cleanRow);
    const copL = calcularCopL(cleanRow, fletePromedio);

    return {
      ...cleanRow,
      fletePromedio,
      copL,
    };
  });

  const valoresPromedio = rows
    .map((row) => row.fletePromedio)
    .filter((value) => value !== null && Number.isFinite(value));

  const promedioGlobal = valoresPromedio.length
    ? valoresPromedio.reduce((acc, value) => acc + value, 0) /
      valoresPromedio.length
    : null;

  return {
    ...plain,
    rows,
    promedioGlobal,
  };
};

const obtenerUsuario = (req) => {
  return (
    req.user?.email ||
    req.user?.nombre ||
    req.usuario?.email ||
    req.usuario?.nombre ||
    ""
  );
};

export const obtenerMatrizActual = async (req, res) => {
  try {
    let matriz = await RutasFletesAmbiocom.findOne({ activo: true }).sort({
      updatedAt: -1,
    });

    if (!matriz) {
      matriz = await RutasFletesAmbiocom.create({
        nombre: "Matriz rutas fletes Ambiocom",
        transportadoras: DEFAULT_TRANSPORTADORAS,
        rows: [emptyRow(DEFAULT_TRANSPORTADORAS.length)],
        creadoPor: obtenerUsuario(req),
        actualizadoPor: obtenerUsuario(req),
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Matriz consultada correctamente.",
      data: hidratarMatriz(matriz),
    });
  } catch (error) {
    console.error("Error obtenerMatrizActual:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al consultar la matriz de rutas y fletes.",
      error: error.message,
    });
  }
};

export const crearMatriz = async (req, res) => {
  try {
    const {
      nombre = "Matriz rutas fletes Ambiocom",
      descripcion = "",
      transportadoras = DEFAULT_TRANSPORTADORAS,
      rows = [],
      activo = true,
    } = req.body;

    const transportadorasNormalizadas =
      normalizarTransportadoras(transportadoras);

    const rowsNormalizadas = normalizarRows(
      rows,
      transportadorasNormalizadas.length
    );

    const nuevaMatriz = await RutasFletesAmbiocom.create({
      nombre,
      descripcion,
      transportadoras: transportadorasNormalizadas,
      rows: rowsNormalizadas,
      activo,
      creadoPor: obtenerUsuario(req),
      actualizadoPor: obtenerUsuario(req),
    });

    return res.status(201).json({
      ok: true,
      message: "Matriz creada correctamente.",
      data: hidratarMatriz(nuevaMatriz),
    });
  } catch (error) {
    console.error("Error crearMatriz:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al crear la matriz de rutas y fletes.",
      error: error.message,
    });
  }
};

export const guardarMatrizActual = async (req, res) => {
  try {
    const {
      nombre = "Matriz rutas fletes Ambiocom",
      descripcion = "",
      transportadoras = DEFAULT_TRANSPORTADORAS,
      rows = [],
    } = req.body;

    const transportadorasNormalizadas =
      normalizarTransportadoras(transportadoras);

    const rowsNormalizadas = normalizarRows(
      rows,
      transportadorasNormalizadas.length
    );

    let matriz = await RutasFletesAmbiocom.findOne({ activo: true }).sort({
      updatedAt: -1,
    });

    if (!matriz) {
      matriz = new RutasFletesAmbiocom({
        activo: true,
        creadoPor: obtenerUsuario(req),
      });
    }

    matriz.nombre = nombre;
    matriz.descripcion = descripcion;
    matriz.transportadoras = transportadorasNormalizadas;
    matriz.rows = rowsNormalizadas;
    matriz.actualizadoPor = obtenerUsuario(req);

    await matriz.save();

    return res.status(200).json({
      ok: true,
      message: "Matriz guardada correctamente.",
      data: hidratarMatriz(matriz),
    });
  } catch (error) {
    console.error("Error guardarMatrizActual:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al guardar la matriz de rutas y fletes.",
      error: error.message,
    });
  }
};

export const actualizarMatrizPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { nombre, descripcion, transportadoras, rows, activo } = req.body;

    const matriz = await RutasFletesAmbiocom.findById(id);

    if (!matriz) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la matriz solicitada.",
      });
    }

    if (nombre !== undefined) matriz.nombre = nombre;
    if (descripcion !== undefined) matriz.descripcion = descripcion;
    if (activo !== undefined) matriz.activo = Boolean(activo);

    if (transportadoras !== undefined) {
      matriz.transportadoras = normalizarTransportadoras(transportadoras);
    }

    if (rows !== undefined) {
      matriz.rows = normalizarRows(rows, matriz.transportadoras.length);
    }

    matriz.actualizadoPor = obtenerUsuario(req);

    await matriz.save();

    return res.status(200).json({
      ok: true,
      message: "Matriz actualizada correctamente.",
      data: hidratarMatriz(matriz),
    });
  } catch (error) {
    console.error("Error actualizarMatrizPorId:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar la matriz.",
      error: error.message,
    });
  }
};

export const actualizarTransportadoras = async (req, res) => {
  try {
    const { id } = req.params;
    const { transportadoras } = req.body;

    if (!Array.isArray(transportadoras) || !transportadoras.length) {
      return res.status(400).json({
        ok: false,
        message: "Debes enviar un arreglo de transportadoras.",
      });
    }

    const matriz = await RutasFletesAmbiocom.findById(id);

    if (!matriz) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la matriz solicitada.",
      });
    }

    matriz.transportadoras = normalizarTransportadoras(transportadoras);
    matriz.rows = normalizarRows(matriz.rows, matriz.transportadoras.length);
    matriz.actualizadoPor = obtenerUsuario(req);

    await matriz.save();

    return res.status(200).json({
      ok: true,
      message: "Transportadoras actualizadas correctamente.",
      data: hidratarMatriz(matriz),
    });
  } catch (error) {
    console.error("Error actualizarTransportadoras:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar las transportadoras.",
      error: error.message,
    });
  }
};

export const agregarFila = async (req, res) => {
  try {
    const { id } = req.params;
    const { row } = req.body;

    const matriz = await RutasFletesAmbiocom.findById(id);

    if (!matriz) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la matriz solicitada.",
      });
    }

    const cleanRow = limpiarRow(row || {});
    const currentFletes = Array.isArray(cleanRow.fletes) ? cleanRow.fletes : [];

    const nuevaFila = {
      ...emptyRow(matriz.transportadoras.length),
      ...cleanRow,
      fletes: Array.from(
        { length: matriz.transportadoras.length },
        (_, index) => currentFletes[index] ?? ""
      ),
    };

    matriz.rows.push(nuevaFila);
    matriz.actualizadoPor = obtenerUsuario(req);

    await matriz.save();

    return res.status(201).json({
      ok: true,
      message: "Fila agregada correctamente.",
      data: hidratarMatriz(matriz),
    });
  } catch (error) {
    console.error("Error agregarFila:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al agregar la fila.",
      error: error.message,
    });
  }
};

export const actualizarFila = async (req, res) => {
  try {
    const { id, rowId } = req.params;
    const { field, value, row } = req.body;

    const matriz = await RutasFletesAmbiocom.findById(id);

    if (!matriz) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la matriz solicitada.",
      });
    }

    const fila = matriz.rows.id(rowId);

    if (!fila) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la fila solicitada.",
      });
    }

    if (row && typeof row === "object") {
      Object.entries(row).forEach(([key, val]) => {
        if (
          key === "_id" ||
          key === "id" ||
          key === "prioridad" ||
          key === "transportadora" ||
          key === "fletePromedio" ||
          key === "copL"
        ) {
          return;
        }

        fila[key] = val;
      });
    }

    if (field) {
      if (
        field === "prioridad" ||
        field === "transportadora" ||
        field === "fletePromedio" ||
        field === "copL"
      ) {
        return res.status(400).json({
          ok: false,
          message: `El campo ${field} no es editable en la fila.`,
        });
      }

      if (field.startsWith("flete_")) {
        const fleteIndex = Number(field.replace("flete_", ""));

        if (!Number.isInteger(fleteIndex) || fleteIndex < 0) {
          return res.status(400).json({
            ok: false,
            message: "Índice de flete inválido.",
          });
        }

        if (fleteIndex >= matriz.transportadoras.length) {
          return res.status(400).json({
            ok: false,
            message: "El índice de flete excede las transportadoras activas.",
          });
        }

        const currentFletes = Array.isArray(fila.fletes) ? fila.fletes : [];

        fila.fletes = Array.from(
          { length: matriz.transportadoras.length },
          (_, index) => currentFletes[index] ?? ""
        );

        fila.fletes[fleteIndex] = value;
      } else {
        fila[field] = value;
      }
    }

    matriz.actualizadoPor = obtenerUsuario(req);

    await matriz.save();

    return res.status(200).json({
      ok: true,
      message: "Fila actualizada correctamente.",
      data: hidratarMatriz(matriz),
    });
  } catch (error) {
    console.error("Error actualizarFila:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar la fila.",
      error: error.message,
    });
  }
};

export const eliminarFila = async (req, res) => {
  try {
    const { id, rowId } = req.params;

    const matriz = await RutasFletesAmbiocom.findById(id);

    if (!matriz) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la matriz solicitada.",
      });
    }

    const fila = matriz.rows.id(rowId);

    if (!fila) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la fila solicitada.",
      });
    }

    fila.deleteOne();

    if (!matriz.rows.length) {
      matriz.rows.push(emptyRow(matriz.transportadoras.length));
    }

    matriz.actualizadoPor = obtenerUsuario(req);

    await matriz.save();

    return res.status(200).json({
      ok: true,
      message: "Fila eliminada correctamente.",
      data: hidratarMatriz(matriz),
    });
  } catch (error) {
    console.error("Error eliminarFila:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al eliminar la fila.",
      error: error.message,
    });
  }
};

export const desactivarMatriz = async (req, res) => {
  try {
    const { id } = req.params;

    const matriz = await RutasFletesAmbiocom.findById(id);

    if (!matriz) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la matriz solicitada.",
      });
    }

    matriz.activo = false;
    matriz.actualizadoPor = obtenerUsuario(req);

    await matriz.save();

    return res.status(200).json({
      ok: true,
      message: "Matriz desactivada correctamente.",
      data: hidratarMatriz(matriz),
    });
  } catch (error) {
    console.error("Error desactivarMatriz:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al desactivar la matriz.",
      error: error.message,
    });
  }
};