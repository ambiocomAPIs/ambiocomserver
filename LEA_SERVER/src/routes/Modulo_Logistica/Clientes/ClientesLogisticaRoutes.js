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
router.get("/:id",requireAuth, requireRole("developer","liderlogistica","auxiliarlogistica1", "auxiliarlogistica2", "torrecontrollogistica"), getClienteById);
router.post("/",requireAuth, requireRole("developer","liderlogistica","auxiliarlogistica1", "auxiliarlogistica2", "torrecontrollogistica"), createCliente);
router.put("/:id",requireAuth, requireRole("developer","liderlogistica","auxiliarlogistica1", "auxiliarlogistica2", "torrecontrollogistica"), updateCliente);
router.delete("/:id",requireAuth, requireRole("developer","liderlogistica","auxiliarlogistica1", "auxiliarlogistica2", "torrecontrollogistica"), deleteCliente);

export default router;