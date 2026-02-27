import ProgramacionDespacho from "../../../models/Modulo_Logistica/ProgramacionDespacho/ProgramacionDespacho.model.js";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const normalizeText = (v) =>
  String(v ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizePlate = (v) => normalizeText(v).toUpperCase().replace(/\s+/g, "");

const isValidISODate = (s) => {
  const v = normalizeText(s);
  if (!ISO_DATE_REGEX.test(v)) return false;

  const [yyyy, mm, dd] = v.split("-").map((x) => Number(x));
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;

  const dt = new Date(yyyy, mm - 1, dd);
  return dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
};

const validatePayload = (body) => {
  const errors = [];

  const fecha = normalizeText(body.fecha);
  const cliente = normalizeText(body.cliente);
  const producto = normalizeText(body.producto);
  const destino = normalizeText(body.destino);

  const cantidad = Number(body.cantidad);

  if (!fecha || !isValidISODate(fecha)) {
    errors.push('La fecha debe tener formato "YYYY-MM-DD" y ser válida.');
  }

  if (!cliente) errors.push("El cliente es obligatorio.");
  if (!producto) errors.push("El producto es obligatorio.");
  if (!destino) errors.push("El destino es obligatorio.");

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    errors.push("La cantidad debe ser un número mayor a 0.");
  }

  // Placa (opcional, validación suave)
  const placa = normalizeText(body.placa);
  if (placa && normalizePlate(placa).length < 5) {
    errors.push("La placa parece inválida (muy corta).");
  }

  return errors;
};

// =====================================================
// GET /api/programaciondespacho
// - fecha=YYYY-MM-DD (exacta)
// - filtros: cliente, producto, transportadora, destino
// - buscador global: q
// =====================================================
export const getProgramaciones = async (req, res) => {
  try {
    const { fecha, cliente, producto, transportadora, destino, q } = req.query;

    const filter = {};

    // ✅ Fecha exacta
    if (fecha) {
      const f = normalizeText(fecha);
      if (!isValidISODate(f)) {
        return res.status(400).json({ message: 'Filtro fecha inválido. Use "YYYY-MM-DD".' });
      }
      filter.fecha = f;
    }

    if (cliente) filter.cliente = normalizeText(cliente);
    if (producto) filter.producto = normalizeText(producto);
    if (transportadora) filter.transportadora = normalizeText(transportadora);
    if (destino) filter.destino = normalizeText(destino);

    // ✅ Buscador global
    if (q) {
      const text = normalizeText(q);
      const re = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { fecha: re },
        { placa: re },
        { trailer: re },
        { conductor: re },
        { transportadora: re },
        { cliente: re },
        { destino: re },
        { producto: re },
      ];
    }

    const data = await ProgramacionDespacho.find(filter).sort({ fecha: 1, createdAt: -1 });
    return res.json(data);
  } catch (error) {
    console.error("getProgramaciones error:", error);
    return res.status(500).json({ message: "Error consultando programaciones." });
  }
};

// =====================================================
// ✅ NUEVO: GET /api/programaciondespacho/rango?from=YYYY-MM-DD&to=YYYY-MM-DD
// - rango incluyente por string ISO
// - opcional: cliente, producto, transportadora, destino, q
// =====================================================
export const getProgramacionesByRango = async (req, res) => {
  try {
    const { from, to, cliente, producto, transportadora, destino, q } = req.query;

    const fFrom = from ? normalizeText(from) : null;
    const fTo = to ? normalizeText(to) : null;

    if (!fFrom && !fTo) {
      return res.status(400).json({
        message: 'Debes enviar al menos "from" o "to" en formato YYYY-MM-DD.',
      });
    }

    if (fFrom && !isValidISODate(fFrom)) {
      return res.status(400).json({ message: 'Filtro "from" inválido. Use "YYYY-MM-DD".' });
    }

    if (fTo && !isValidISODate(fTo)) {
      return res.status(400).json({ message: 'Filtro "to" inválido. Use "YYYY-MM-DD".' });
    }

    if (fFrom && fTo && fFrom > fTo) {
      return res.status(400).json({
        message: 'Rango inválido: "from" no puede ser mayor que "to".',
      });
    }

    const filter = {};

    // ✅ Rango incluyente sobre string ISO
    filter.fecha = {};
    if (fFrom) filter.fecha.$gte = fFrom;
    if (fTo) filter.fecha.$lte = fTo;

    // ✅ filtros opcionales (por si el front los manda)
    if (cliente) filter.cliente = normalizeText(cliente);
    if (producto) filter.producto = normalizeText(producto);
    if (transportadora) filter.transportadora = normalizeText(transportadora);
    if (destino) filter.destino = normalizeText(destino);

    // ✅ buscador opcional
    if (q) {
      const text = normalizeText(q);
      const re = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { fecha: re },
        { placa: re },
        { trailer: re },
        { conductor: re },
        { transportadora: re },
        { cliente: re },
        { destino: re },
        { producto: re },
      ];
    }

    const data = await ProgramacionDespacho.find(filter).sort({ fecha: 1, createdAt: -1 });
    return res.json(data);
  } catch (error) {
    console.error("getProgramacionesByRango error:", error);
    return res.status(500).json({ message: "Error consultando programaciones por rango." });
  }
};

// GET /api/programaciondespacho/:id
export const getProgramacionById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await ProgramacionDespacho.findById(id);
    if (!doc) return res.status(404).json({ message: "Programación no encontrada." });

    return res.json(doc);
  } catch (error) {
    console.error("getProgramacionById error:", error);
    return res.status(400).json({ message: "ID inválido o error consultando programación." });
  }
};

// POST /api/programaciondespacho
export const createProgramacion = async (req, res) => {
  try {
    const errors = validatePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: errors.join(" ") });
    }

    const payload = {
      fecha: normalizeText(req.body.fecha),
      placa: normalizeText(req.body.placa),
      trailer: normalizeText(req.body.trailer),
      conductor: normalizeText(req.body.conductor),
      transportadora: normalizeText(req.body.transportadora),
      cliente: normalizeText(req.body.cliente),
      destino: normalizeText(req.body.destino),
      producto: normalizeText(req.body.producto),
      cantidad: Number(req.body.cantidad),
    };

    const created = await ProgramacionDespacho.create(payload);
    return res.status(201).json(created);
  } catch (error) {
    console.error("createProgramacion error:", error);

    if (error?.name === "ValidationError") {
      const msg = Object.values(error.errors).map((e) => e.message).join(" ");
      return res.status(400).json({ message: msg || "Datos inválidos." });
    }

    return res.status(500).json({ message: "Error creando programación." });
  }
};

// PUT /api/programaciondespacho/:id
export const updateProgramacion = async (req, res) => {
  try {
    const { id } = req.params;

    const errors = validatePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ message: errors.join(" ") });
    }

    const payload = {
      fecha: normalizeText(req.body.fecha),
      placa: normalizeText(req.body.placa),
      trailer: normalizeText(req.body.trailer),
      conductor: normalizeText(req.body.conductor),
      transportadora: normalizeText(req.body.transportadora),
      cliente: normalizeText(req.body.cliente),
      destino: normalizeText(req.body.destino),
      producto: normalizeText(req.body.producto),
      cantidad: Number(req.body.cantidad),
    };

    const updated = await ProgramacionDespacho.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Programación no encontrada." });

    return res.json(updated);
  } catch (error) {
    console.error("updateProgramacion error:", error);

    if (error?.name === "ValidationError") {
      const msg = Object.values(error.errors).map((e) => e.message).join(" ");
      return res.status(400).json({ message: msg || "Datos inválidos." });
    }

    return res.status(400).json({ message: "No se pudo actualizar la programación." });
  }
};

// DELETE /api/programaciondespacho/:id
export const deleteProgramacion = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ProgramacionDespacho.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Programación no encontrada." });

    return res.json({ message: "Programación eliminada correctamente." });
  } catch (error) {
    console.error("deleteProgramacion error:", error);
    return res.status(400).json({ message: "No se pudo eliminar la programación." });
  }
};