import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  try {
    const cookieName = process.env.COOKIE_NAME || "token";
    const token = req.cookies?.[cookieName];
    if (!token) return res.status(401).json({ message: "No autenticado" });

    const payload = verifyToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

// Útil si quieres “admin” fijo o varios roles permitidos
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "No autenticado" });
    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ message: "No autorizado" });
    }
    next();
  };
}
