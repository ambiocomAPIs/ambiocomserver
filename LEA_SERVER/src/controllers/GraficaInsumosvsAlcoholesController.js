import GraficaInsumosvsAlcoholes from "../models/GraficaInsumosvsAlcoholesModel.js";

// Crear nuevo registro
export const crearGraficaInsumoskgoh = async (req, res) => {
  console.log("body que ñllega al backed:", req.body);
  
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
