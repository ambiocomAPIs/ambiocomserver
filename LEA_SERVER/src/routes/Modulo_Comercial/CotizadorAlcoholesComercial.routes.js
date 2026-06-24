import express from "express";

import {
  crearCotizacionAlcohol,
  listarCotizacionesAlcohol,
  obtenerCotizacionAlcoholPorId,
  actualizarCotizacionAlcohol,
  cambiarEstadoCotizacionAlcohol,
  eliminarCotizacionAlcohol,
  resumenCotizacionesAlcohol,
} from "../../controllers/Modulo_Comercial/CotizadorAlcoholesComercial.Controller.js";

const router = express.Router();

router.get("/", listarCotizacionesAlcohol);
router.get("/resumen", resumenCotizacionesAlcohol);
router.get("/:id", obtenerCotizacionAlcoholPorId);

router.post("/", crearCotizacionAlcohol);

router.put("/:id", actualizarCotizacionAlcohol);
router.patch("/:id/estado", cambiarEstadoCotizacionAlcohol);

router.delete("/:id", eliminarCotizacionAlcohol);

export default router;