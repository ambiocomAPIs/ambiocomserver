import { Router } from "express";
import { verifyColumnsAccess } from "../../controllers/Dev_Functions/authDevCredentials.controller.js";

const router = Router();

router.post("/verify-columns", verifyColumnsAccess);

export default router;