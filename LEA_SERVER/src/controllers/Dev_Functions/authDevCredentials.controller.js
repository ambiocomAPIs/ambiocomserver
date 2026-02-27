export async function verifyColumnsAccess(req, res) {
  try {
    const { rol, password } = req.body || {};

    // Validación básica
    if (!rol || !password) {
      return res.status(400).json({
        ok: false,
        message: "Alto ahi! No tienes permisos para hacer esto",
      });
    }

    if (rol !== "developer") {
      return res.status(403).json({
        ok: false,
        message: "Acceso restringido: No tienes permisos para hacer esto",
      });
    }

    const PASS = process.env.ADMIN_PASSWORD ;

    if (password !== PASS) {
      return res.status(401).json({
        ok: false,
        message: "Acceso Denegado!",
      });
    }

    // ✅ Acceso autorizado
    return res.json({
      ok: true,
      message: "Acceso concedido, Bienvenido Desarrollador",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      message: "Error interno",
    });
  }
}