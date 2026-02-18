import { Router } from "express";
import {
  crearIngresoCarbonMadera,
  listarIngresoCarbonMadera,
  editarIngresoCarbonMadera,
  desactivarIngresoCarbonMadera,
} from "../controllers/ColumnaIngresoCarbonMaderaControlles.js";

const router = Router();

router.get("/", listarIngresoCarbonMadera,);
router.post("/", crearIngresoCarbonMadera);
router.put("/:id", editarIngresoCarbonMadera);
router.delete("/:id", desactivarIngresoCarbonMadera);

export default router;
