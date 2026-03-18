import TrafficLog from "../../models/System/TrafficLog.model.js";

export const getTrafficLogs = async (req, res) => {
  try {
    const { moduleName, method, limit = 100 } = req.query;

    const filter = {};

    if (moduleName) filter.moduleName = moduleName;
    if (method) filter.method = method.toUpperCase();

    const logs = await TrafficLog.find(filter)
      .sort({ requestedAt: -1 })
      .limit(Number(limit));

    res.json({
      ok: true,
      total: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error obteniendo logs",
      error: error.message,
    });
  }
};

export const deleteTrafficLogs = async (req, res) => {
  try {
    await TrafficLog.deleteMany({});

    res.json({
      ok: true,
      message: "Logs eliminados correctamente",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error eliminando logs",
      error: error.message,
    });
  }
};