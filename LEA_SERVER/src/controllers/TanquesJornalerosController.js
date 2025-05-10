// controllers/TanquesJornalerosController.js
import TanquesJornaleros from '../models/TanquesJornalerosModels.js';

// Controlador para obtener los datos de todos los tanques
export const getTanquesData = async (req, res) => {
  try {
    const tanques = await TanquesJornaleros.find();
    res.status(200).json(tanques);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los datos de los tanques.' });
  }
};
