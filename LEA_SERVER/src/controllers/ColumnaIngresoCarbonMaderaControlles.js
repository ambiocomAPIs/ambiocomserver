import IngresoCarbonMadera from "../models/ColumnaIngresoCarbonMaderaModels.js"

/* ========== CREAR ========== */
export const crearIngresoCarbonMadera = async (req, res) => {
  console.log("repsuesta:", req.body);
  
  try {
    const Ingreso = await IngresoCarbonMadera.create(req.body);
    console.log("ingreso:", Ingreso);
    
    res.status(201).json(Ingreso);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ========== LISTAR ========== */
export const listarIngresoCarbonMadera = async (req, res) => {
  const Ingreso = await IngresoCarbonMadera.find({ activo: true }).sort("createdAt");
  res.json(Ingreso);
};

/* ========== EDITAR ========== */
export const editarIngresoCarbonMadera = async (req, res) => {
  const Ingreso = await IngresoCarbonMadera.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(Ingreso);
};

/* ========== DESACTIVAR ========== */
export const desactivarIngresoCarbonMadera = async (req, res) => {
  await IngresoCarbonMadera.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ ok: true });
};
