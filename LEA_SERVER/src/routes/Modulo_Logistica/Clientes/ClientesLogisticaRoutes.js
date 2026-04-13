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
router.get("/:id", getClienteById);
router.post("/", createCliente);
router.put("/:id", updateCliente);
router.delete("/:id", deleteCliente);

export default router;