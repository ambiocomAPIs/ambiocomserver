import GraficaInsumosvsAlcoholes from "../models/GraficaInsumosvsAlcoholesModel.js";
import GraficaCostosInsumosvsAlcoholesModel from "../models/GraficaCostosInsumosvsAlcoholesModel.js";

// Crear nuevo registro
export const crearGraficaInsumoskgoh = async (req, res) => {
  
  try {
    const nuevaProduccion = new GraficaInsumosvsAlcoholes(req.body);
    await nuevaProduccion.save();
    res.status(201).json({ message: "Producción guardada con éxito", data: nuevaProduccion });
  } catch (error) {
    console.error("Error al guardar producción:", error);
    res.status(500).json({ message: "Error al guardar producción", error });
  }
};

// Obtener todos los registros
export const obtenerGraficaInsumoskgoh = async (req, res) => {
  try {
    const producciones = await GraficaInsumosvsAlcoholes.find().sort({ fechaRegistro: -1 });
    res.status(200).json(producciones);
  } catch (error) {
    console.error("Error al obtener producciones:", error);
    res.status(500).json({ message: "Error al obtener producciones", error });
  }
};

// aqui empiezan los endpoint para precio por litro
// Crear nuevo registro
export const crearGraficaInsumoscopoh = async (req, res) => {
  console.log("LLEGA AL BACKEND:", req.body);
  
  
  try {
    const nuevaProduccion = new GraficaCostosInsumosvsAlcoholesModel(req.body);
    await nuevaProduccion.save();
    res.status(201).json({ message: "Producción guardada con éxito", data: nuevaProduccion });
  } catch (error) {
    console.error("Error al guardar producción:", error);
    res.status(500).json({ message: "Error al guardar producción", error });
  }
};

// Obtener todos los registros
export const obtenerGraficaInsumoscopoh = async (req, res) => {
  try {
    const producciones = await GraficaCostosInsumosvsAlcoholesModel.find().sort({ fechaRegistro: -1 });
    res.status(200).json(producciones);
  } catch (error) {
    console.error("Error al obtener producciones:", error);
    res.status(500).json({ message: "Error al obtener producciones", error });
  }
};
