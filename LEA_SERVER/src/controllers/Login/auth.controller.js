import { User } from "../../models/Login/User.js";
import { signToken } from "../../utils/jwt.js";

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email y password son requeridos" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = signToken({
      sub: user._id.toString(),
      email: user.email,
      rol: user.rol,
    });

    res.cookie(process.env.COOKIE_NAME || "token", token, cookieOptions());

    return res.json({
      message: "Login OK",
      user: { id: user._id, email: user.email, rol: user.rol },
    });
  } catch (err) {
    return res.status(500).json({ message: "Error en login", error: err.message });
  }
}

export async function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME || "token", { path: "/" });
  return res.json({ message: "Logout OK" });
}

export async function me(req, res) {
  return res.json({ user: req.user });
}
