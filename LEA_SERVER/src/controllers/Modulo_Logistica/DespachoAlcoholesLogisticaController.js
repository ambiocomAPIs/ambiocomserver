import XLSX from "xlsx";
import fs from "fs";
import ModelDespachoAlcohol from "../../models/Modulo_Logistica/DespachoAlcoholesLogisticaModels.js";
import ColumnaDespacho from "../../models/Modulo_Logistica/ColumnaDespachoAlcoholesLogisticaModels.js";

const CAMPOS_FIJOS = ["fecha", "responsable", "observaciones"];

// ============================
// ✅ HELPERS PARA /rango
// ============================
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const normalizeText = (v) =>
  String(v ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isValidISODate = (s) => {
  const v = normalizeText(s);
  if (!ISO_DATE_REGEX.test(v)) return false;

  const [yyyy, mm, dd] = v.split("-").map((x) => Number(x));
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;

  const dt = new Date(yyyy, mm - 1, dd);
  return dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
};

/* ================= CREAR ================= */
export const crearDespachoAlcohol = async (req, res) => {
  console.log("respuesta que llega:", req.body);

  try {
    const { fecha, responsable, observaciones, lecturas } = req.body;

    if (!fecha || !responsable || !lecturas) {
      return res.status(400).json({
        message: "Campos obligatorios incompletos",
      });
    }

    const nuevaMedicion = new ModelDespachoAlcohol({
      fecha,
      responsable,
      observaciones,
      lecturas,
    });

    const guardado = await nuevaMedicion.save();

    res.status(201).json(guardado);
  } catch (error) {
    res.status(500).json({
      message: "Error al crear Ingreso",
      error: error.message,
    });
  }
};

/* ================= LISTAR ================= */
export const obtenerDespachoAlcohol = async (req, res) => {
  try {
    const mediciones = await ModelDespachoAlcohol.find().sort({
      createdAt: 1,
    });

    res.json(mediciones);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los ingresos de carbon y madera",
      error: error.message,
    });
  }
};

/* =======================================================
   ✅ NUEVO ENDPOINT
   GET /api/despacho-alcoholes/rango?from=YYYY-MM-DD&to=YYYY-MM-DD
   - rango incluyente sobre "fecha" tipo STRING (YYYY-MM-DD)
   - (Opcional) soporta q para buscar dentro de lecturas/responsable/observaciones si quieres
======================================================= */
export const obtenerDespachoAlcoholByRango = async (req, res) => {
  try {
    const { from, to, q } = req.query;

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

    // ✅ Rango incluyente sobre string ISO YYYY-MM-DD
    filter.fecha = {};
    if (fFrom) filter.fecha.$gte = fFrom;
    if (fTo) filter.fecha.$lte = fTo;

    // ✅ buscador opcional
    if (q) {
      const text = normalizeText(q);
      const re = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { fecha: re },
        { responsable: re },
        { observaciones: re },
        // Busca dentro del objeto lecturas (Mongo permite regex por paths)
        { "lecturas.placa": re },
        { "lecturas.transportadora": re },
        { "lecturas.cliente": re },
        { "lecturas.producto": re },
      ];
    }

    const data = await ModelDespachoAlcohol.find(filter).sort({ fecha: 1, createdAt: -1 });

    return res.json(data);
  } catch (error) {
    console.error("obtenerDespachoAlcoholByRango error:", error);
    return res.status(500).json({
      message: "Error consultando despachos por rango.",
      error: error.message,
    });
  }
};

/* ================= OBTENER POR ID ================= */
export const obtenerDespachoAlcoholPorId = async (req, res) => {
  try {
    const medicion = await ModelDespachoAlcohol.findById(req.params.id);

    if (!medicion) {
      return res.status(404).json({
        message: "ingreso de carbon/madera no encontrada",
      });
    }

    res.json(medicion);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ingreso de carbon/madera",
      error: error.message,
    });
  }
};

/* ================= ACTUALIZAR ================= */
export const actualizarDespachoAlcohol = async (req, res) => {
  try {
    const medicionActualizada = await ModelDespachoAlcohol.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(medicionActualizada);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar medición de agua",
      error: error.message,
    });
  }
};

/* ================= ELIMINAR ================= */
export const eliminarDespachoAlcohol = async (req, res) => {
  try {
    await ModelDespachoAlcohol.findByIdAndDelete(req.params.id);

    res.json({
      message: "Medición de agua eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar medición de agua",
      error: error.message,
    });
  }
};

// Carga masivo desde Excel
export const cargarDespachoAlcoholDesdeExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }

    console.log("📥 Archivo recibido:", req.file.originalname);

    /* ===== Leer Excel ===== */
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rawJson = XLSX.utils.sheet_to_json(sheet, {
      defval: null,
      raw: false,
      blankrows: false,
    });

    console.log("📊 Filas crudas Excel:", rawJson.length);

    if (!rawJson.length) {
      return res.status(400).json({ error: "El Excel está vacío" });
    }

    /* ===== Leer headers SIN modificar ===== */
    const normalizarFila = (fila) => {
      const out = {};
      Object.keys(fila).forEach((k) => {
        if (!k || k === "undefined") return;

        const key = k.trim(); // ⚠️ SOLO trim
        out[key] = fila[k];
      });
      return out;
    };

    let filas = rawJson.map(normalizarFila);

    console.log("🧾 Primera fila normalizada:", filas[0]);

    /* ===== Eliminar filas vacías ===== */
    filas = filas.filter((f) =>
      Object.values(f).some((v) => v !== null && v !== "" && v !== undefined)
    );

    console.log("🧹 Filas después de limpiar vacías:", filas.length);

    /* ===== Validación dinámica ===== */
    const columnas = await ColumnaDespacho.find({});
    const keysColumnas = columnas.map((c) => c.key.trim());

    console.log("🗄️ Keys BD:", keysColumnas);

    const headersExcel = Object.keys(filas[0]).map((h) => h.trim());

    console.log("📑 Headers Excel:", headersExcel);

    const headersDinamicos = headersExcel.filter((h) => !CAMPOS_FIJOS.includes(h));

    console.log("⚙️ Headers dinámicos:", headersDinamicos);

    const headersInvalidos = headersDinamicos.filter((h) => !keysColumnas.includes(h));

    console.log("❌ Headers inválidos:", headersInvalidos);

    if (headersInvalidos.length > 0) {
      return res.status(400).json({
        error: "El Excel tiene columnas dinámicas no registradas en la BD",
        headersInvalidos,
      });
    }

    /* ===== Helpers ===== */
    const limpiarValores = (obj) => {
      Object.keys(obj).forEach((k) => {
        if (
          obj[k] === null ||
          obj[k] === "" ||
          obj[k] === "-" ||
          obj[k] === "N/A" ||
          obj[k] === undefined
        ) {
          obj[k] = "NA";
        } else if (typeof obj[k] === "string") {
          obj[k] = obj[k].trim();
        }
      });
    };

    const normalizarFecha = (fecha) => {
      let fechaObj;
      if (fecha instanceof Date) fechaObj = fecha;
      else if (typeof fecha === "number") fechaObj = new Date(Date.UTC(1900, 0, fecha - 1));
      else if (typeof fecha === "string") {
        const parsed = new Date(fecha);
        if (isNaN(parsed)) throw new Error(`Fecha inválida: ${fecha}`);
        fechaObj = parsed;
      } else throw new Error("Tipo de fecha no soportado");

      return fechaObj.toISOString().slice(0, 10);
    };

    /* ===== Procesar filas ===== */
    let insertados = 0;
    let errores = [];

    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];

      console.log(`➡️ Procesando fila ${i + 2}:`, fila);

      try {
        let { fecha, responsable, observaciones, ...lecturas } = fila;

        console.log("📅 Fecha cruda:", fecha);
        console.log("📦 Lecturas crudas:", lecturas);

        if (!fecha) throw new Error("Fecha obligatoria");

        fecha = normalizarFecha(fecha);

        console.log("📅 Fecha normalizada:", fecha);

        limpiarValores(lecturas);

        console.log("🧪 Lecturas limpias:", lecturas);

        await ModelDespachoAlcohol.create({
          fecha,
          responsable: responsable || "NA",
          observaciones: observaciones || "NA",
          lecturas,
        });

        console.log("✅ Insertada fila", i + 2);

        insertados++;
      } catch (e) {
        console.error("💥 Error fila", i + 2, e.message);

        errores.push({
          filaExcel: i + 2,
          error: e.message,
          datos: fila,
        });
      }
    }

    /* ===== Respuesta ===== */
    console.log("📈 Resultado:", {
      totalFilas: filas.length,
      insertados,
      errores: errores.length,
    });

    res.json({
      totalFilas: filas.length,
      insertados,
      errores,
      mensaje: "Carga completada correctamente",
    });
  } catch (error) {
    console.error("❌ Error general carga Excel:", error);
    res.status(500).json({
      error: "Error procesando el archivo Excel",
      detalle: error.message,
    });
  }
};

// Descargar plantilla
export const descargaPlantillaExcel = async (req, res) => {
  try {
    const columnas = await ColumnaDespacho.find({});
    const keysColumnas = columnas.map((c) => c.key);

    const headers = [...CAMPOS_FIJOS, ...keysColumnas];

    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=plantilla_Despacho_alcoholes.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (error) {
    console.error("Error generando plantilla:", error);
    res.status(500).json({ error: "Error generando plantilla Excel" });
  }
};