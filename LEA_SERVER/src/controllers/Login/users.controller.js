import { User } from "../../models/Login/User.js";

// Crear usuario (interno)
export async function createUser(req, res) {
  try {
    const { email, password, rol, isActive } = req.body;

    if (!email || !password || !rol) {
      return res.status(400).json({ message: "email, password y rol son requeridos" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Contraseña mínimo 8 caracteres" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "El email ya existe" });

    const user = new User({
      email,
      rol,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    await user.setPassword(password);
    await user.save();

    return res.status(201).json({
      message: "Usuario creado",
      user: { id: user._id, email: user.email, rol: user.rol, isActive: user.isActive },
    });
  } catch (err) {
    return res.status(500).json({ message: "Error creando usuario", error: err.message });
  }
}

// Editar usuario (interno): email, rol, isActive y opcional password
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { email, rol, isActive, password } = req.body;

    const user = await User.findById(id).select("+passwordHash");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (email) user.email = email.toLowerCase();
    if (rol) user.rol = rol;
    if (typeof isActive === "boolean") user.isActive = isActive;

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ message: "Contraseña mínimo 8 caracteres" });
      }
      await user.setPassword(password);
    }

    await user.save();

    return res.json({
      message: "Usuario actualizado",
      user: { id: user._id, email: user.email, rol: user.rol, isActive: user.isActive },
    });
  } catch (err) {
    // por si choca unique email
    if (err.code === 11000) return res.status(409).json({ message: "Email ya existe" });
    return res.status(500).json({ message: "Error actualizando usuario", error: err.message });
  }
}

// Listar usuarios (interno)
export async function listUsers(req, res) {
  const users = await User.find().select("email rol isActive createdAt updatedAt");
  res.json({ users });
}

// Obtener 1 usuario
export async function getUser(req, res) {
  const user = await User.findById(req.params.id).select("email rol isActive createdAt updatedAt");
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  res.json({ user });
}
