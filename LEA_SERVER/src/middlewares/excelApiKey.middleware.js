export const requireExcelApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        message: "API Key no proporcionada",
      });
    }

    // if (apiKey !== process.env.EXCEL_API_KEY) {
    if (apiKey !== "PMIbD0AdyLzS_FLuEdsQ0BwdHLIA8EZue4AGw3SDavW7CdiiklhVrB4pph26hc1E") {
      return res.status(403).json({
        message: "API Key inválida",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error validando la API Key",
      error: error.message,
    });
  }
};