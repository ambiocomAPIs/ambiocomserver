import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { createUser, updateUser, listUsers, getUser } from "../../controllers/Login/users.controller.js";

const router = Router();

// 🔒 Ajusta el rol que será “admin del sistema”
router.use(requireAuth, requireRole("admin"));

router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", createUser);
router.put("/:id", updateUser);

export default router;
