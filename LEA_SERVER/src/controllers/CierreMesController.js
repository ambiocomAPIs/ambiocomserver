import { Types } from 'mongoose';
const { ObjectId } = Types;

// controllers/data.controller.js
import CierreMes from '../models/CierreMesModels.js';


// Crear un nuevo datos
export const createCierreMes = async (req, res) => {
    try {
      const { MesDeCierre, FechaDeCierre, data } = req.body;
  
      const cierre = new CierreMes({
        MesDeCierre,
        FechaDeCierre,
        dataMes: data // aquí va el array completo
      });
  
      const resultado = await cierre.save();
  
      res.status(201).json({ message: 'Cierre de mes guardado como un solo documento.', data: resultado });
    } catch (error) {
      console.error('Error al guardar el cierre:', error);
      res.status(500).json({ message: 'Error interno al guardar cierre.' });
    }
  };

// Obtener todos los datoss
export const getAllDatasCierreMes = async (req, res) => {
  try {
    const datas = await CierreMes.find();
    res.status(200).json(datas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Eliminar un datos
export const deleteData = async (req, res) => {
  console.log("id que llega al delete:", req.params.id);

  // Validación del ObjectId
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Id no válido' });
  }

  try {
    // Intentar eliminar el documento
    const data = await CierreMes.findByIdAndDelete(req.params.id);

    // Verificar si el documento fue encontrado y eliminado
    console.log("Documento eliminado:", data);

    if (!data) {
      // Si el documento no se encuentra, enviar mensaje de error
      return res.status(404).json({ message: 'Fila no encontrada' });
    }

    // Si se eliminó correctamente, enviar un mensaje de éxito
    return res.status(200).json({ message: 'Fila eliminada correctamente', data });

  } catch (error) {
    // En caso de error en la base de datos
    console.error("Error al eliminar:", error);
    return res.status(400).json({ error: error.message });
  }
};

