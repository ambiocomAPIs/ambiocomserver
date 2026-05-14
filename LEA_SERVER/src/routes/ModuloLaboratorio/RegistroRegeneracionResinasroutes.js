import express from "express";

import {
    createAnalisisAgua,
    updateAnalisisAgua,
    getAnalisisAguaByDate,
    getLatestAnalisisAgua,
    getAllAnalisisAgua,
    deleteAnalisisAgua,
    getFechasAnalisisAgua,
} from "../../controllers/ModuloLaboratorio/RegistroRegeneracionResinascontrollers.js";

const router = express.Router();


router.post("/", createAnalisisAgua);

router.patch("/:id", updateAnalisisAgua);

router.get("/by-date", getAnalisisAguaByDate);

router.get("/latest", getLatestAnalisisAgua);

router.get("/fechas", getFechasAnalisisAgua);

router.get("/", getAllAnalisisAgua);

router.delete("/:id", deleteAnalisisAgua);

export default router;