import { Router } from "express";
import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../../../controllers/Modulo_Logistica/Clientes/ClientesLogisticaController.js";

import { requireAuth, requireRole } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/",requireAuth, requireRole("developer","liderlogistica","auxiliarlogistica1", "auxiliarlogistica2", "torrecontrollogistica"), getClientes);
router.get("/test", getClientes);
// router.get(
//   "/",
//   requireAuth,
//   requireRole("developer"),
//   (req, res) => {
//     return res.json({
//       ok: true,
//       message: "Sí pasó el middleware",
//       user: req.user,
//     });
//   }
// );
router.get("/:id",requireAuth, getClienteById);
router.post("/",requireAuth, createCliente);
router.put("/:id",requireAuth, updateCliente);
router.delete("/:id",requireAuth, deleteCliente);

export default router;