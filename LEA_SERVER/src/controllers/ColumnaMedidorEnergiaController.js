import Medidor from "../models/ColumnaMedidorEnergia.js"

/* ========== CREAR ========== */
export const crearMedidor = async (req, res) => {
  try {
    const medidor = await Medidor.create(req.body);
    res.status(201).json(medidor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ========== LISTAR ========== */
export const listarMedidores = async (req, res) => {
  const medidores = await Medidor.find({ activo: true }).sort("createdAt");
  res.json(medidores);
};

/* ========== EDITAR ========== */
export const editarMedidor = async (req, res) => {
  const medidor = await Medidor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(medidor);
};

/* ========== DESACTIVAR ========== */
export const desactivarMedidor = async (req, res) => {
  await Medidor.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ ok: true });
};
