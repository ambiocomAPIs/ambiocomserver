import AguaAnalisis from "../../models/ModuloLaboratorio/LAB_FO_XX_aguaAnalisis.model.js";

function ddmmyyyyToDate(fecha) {
  if (!fecha) return null;

  const [day, month, year] = fecha.split("-");
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

function dateToDDMMYYYY(date) {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

function getPreviousDateDDMMYYYY(fecha) {
  const date = ddmmyyyyToDate(fecha);
  date.setUTCDate(date.getUTCDate() - 1);

  return dateToDDMMYYYY(date);
}

export async function getLatestAguaAnalisis(req, res) {
  try {
    const latest = await AguaAnalisis.findOne().sort({
      fechaRegistroISO: -1,
      createdAt: -1,
    });

    return res.json({
      ok: true,
      data: latest,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error consultando último registro",
      error: error.message,
    });
  }
}

export async function getAguaAnalisisByDate(req, res) {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        message: "La fecha es requerida en formato DD-MM-YYYY",
      });
    }

    const fechaAnterior = getPreviousDateDDMMYYYY(fecha);

    const actual = await AguaAnalisis.findOne({ fechaRegistro: fecha });
    const anterior = await AguaAnalisis.findOne({
      fechaRegistro: fechaAnterior,
    });

    return res.json({
      ok: true,
      fechaActual: fecha,
      fechaAnterior,
      actual,
      anterior,
      data: actual?.data || null,
      dataDiaAnterior: anterior?.data || null,
      id: actual?._id || null,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error consultando por fecha",
      error: error.message,
    });
  }
}

export async function createAguaAnalisis(req, res) {
  try {
    const { fechaRegistro, data } = req.body;

    if (!fechaRegistro) {
      return res.status(400).json({
        ok: false,
        message: "fechaRegistro es requerida",
      });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({
        ok: false,
        message: "data debe ser un array",
      });
    }

    const exists = await AguaAnalisis.findOne({ fechaRegistro });

    if (exists) {
      return res.status(409).json({
        ok: false,
        message: "Ya existe un registro para esta fecha",
        id: exists._id,
      });
    }

    const created = await AguaAnalisis.create({
      ...req.body,
      fechaRegistroISO: ddmmyyyyToDate(fechaRegistro),
    });

    return res.status(201).json({
      ok: true,
      message: "Registro creado correctamente",
      data: created,
      id: created._id,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error creando registro",
      error: error.message,
    });
  }
}

export async function updateAguaAnalisis(req, res) {
  try {
    const { id } = req.params;
    const { fechaRegistro } = req.body;

    const updatePayload = {
      ...req.body,
    };

    if (fechaRegistro) {
      updatePayload.fechaRegistroISO = ddmmyyyyToDate(fechaRegistro);
    }

    const updated = await AguaAnalisis.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        ok: false,
        message: "Registro no encontrado",
      });
    }

    return res.json({
      ok: true,
      message: "Registro actualizado correctamente",
      data: updated,
      id: updated._id,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error actualizando registro",
      error: error.message,
    });
  }
}