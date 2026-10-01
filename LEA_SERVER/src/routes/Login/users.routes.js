import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { createUser, updateUser, listUsers, getUser } from "../../controllers/Login/users.controller.js";

const router = Router();

// router.use(requireAuth, requireRole("admin"));

router.get("/",requireAuth, requireRole("admin", "developer"),listUsers);
router.get("/:id",requireAuth, requireRole("admin", "developer"), getUser);
router.post("/",requireAuth, requireRole("admin", "developer"), createUser);
router.put("/:id",requireAuth, requireRole("admin", "developer"), updateUser);

export default router;
