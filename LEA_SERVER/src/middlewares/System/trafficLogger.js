import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import TrafficLog from "../../models/System/TrafficLog.model.js";
import { verifyToken } from "../../utils/jwt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, "../../logs");
fs.mkdirSync(logsDir, { recursive: true });

const logFilePath = path.join(logsDir, "trafico.log");

const detectModuleName = (url = "") => {
  const parts = url.split("/").filter(Boolean);

  if (parts[0] === "api" && parts[1]) {
    return parts[1];
  }

  return "general";
};

const getUserInfo = (req) => {
  try {

    // primero intenta usar req.user si ya existe
    if (req.user) {
      return {
        email: req.user.email || "",
        rol: req.user.rol || "Sin rol",
      };
    }

    // si no existe, intenta leer el token de la cookie
    const cookieName = process.env.COOKIE_NAME || "token";
    const token = req.cookies?.[cookieName];

    if (!token) {
      return { email: "", rol: "anonimo" };
    }

    const payload = verifyToken(token);

    return {
      email: payload.email || "",
      rol: payload.rol || "Sin rol",
    };

  } catch {
    return { email: "", rol: "anonimo" };
  }
};

const trafficLogger = (req, res, next) => {

  if (req.originalUrl.startsWith("/api/system/traffic")) {
    return next();
  }

  const allowedMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!allowedMethods.includes(req.method)) {
    return next();
  }

  res.on("finish", async () => {
    try {

      const now = new Date();
      const cleanPath = req.originalUrl.split("?")[0];
      const moduleName = detectModuleName(cleanPath);

      const { email, rol } = getUserInfo(req);

      const fecha = now.toLocaleDateString("es-CO", {
        timeZone: "America/Bogota",
      });

      const hora = now.toLocaleTimeString("es-CO", {
        hour12: false,
        timeZone: "America/Bogota",
      });

      const line =
        `[${fecha} ${hora}] ${req.method} ${cleanPath}` +
        ` | status=${res.statusCode}` +
        ` | rol=${rol}` +
        ` | email=${email || "anonimo"}\n`;

      fs.appendFile(logFilePath, line, () => {});

      await TrafficLog.create({
        method: req.method,
        path: cleanPath,
        moduleName,
        statusCode: res.statusCode,
        email,
        rol,
        requestedAt: now,
      });

    } catch (error) {
      console.error("Error guardando traffic log:", error.message);
    }
  });

  next();
};

export default trafficLogger;