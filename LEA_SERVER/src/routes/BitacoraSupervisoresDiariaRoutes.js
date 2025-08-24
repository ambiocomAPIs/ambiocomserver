import express from "express";
import {
    bitacoraGetAllData,
    bitacorareplaceall,
    updateDataById,
    getBitacoraByFechaYTurno,
} from "../controllers/BitacoraSupervisoresDiariaController.js";

const router = express.Router();

router.get("/", bitacoraGetAllData);
router.get("/getbyfechayturno", getBitacoraByFechaYTurno);
router.post("/bitacorareplaceall", bitacorareplaceall);
router.put("/:id", updateDataById);


export default router;
