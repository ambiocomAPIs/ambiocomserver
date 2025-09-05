import Bitacora from "../models/BitacoraSupervisoresDiariaModels.js";

// Obtener todos los datos
export const bitacoraGetAllData = async (req, res) => {
  try {
    const data = await Bitacora.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar por fecha y turno
export const getBitacoraByFechaYTurno = async (req, res) => {
    
    try {
      const { fecha, turno } = req.query;
      if (!fecha || !turno) {
        return res.status(400).json({ message: "Se requieren 'fecha' y 'turno' como parámetros." });
      }
  
      const result = await Bitacora.find({ fecha, turno });      
  
      if (result.length === 0) {
        return res.status(404).json({ message: "No se encontraron datos para la fecha y turno especificados." });
      }
  
      res.status(200).json(result);
    } catch (error) {
      console.error("❌ Error al obtener datos por fecha y turno:", error);
      res.status(500).json({ message: "Error al buscar en la base de datos." });
    }
  };


export const bitacorareplaceall = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: "Se requiere un arreglo con al menos un objeto." });
    }

    const [incoming] = req.body;
    const { fecha, turno } = incoming;

    if (!fecha || !turno) {
      return res.status(400).json({ message: "Faltan 'fecha' o 'turno' en la solicitud." });
    }

    const savedDoc = await Bitacora.findOneAndUpdate(
      { fecha, turno },       // Criterio de búsqueda
      incoming,               // Datos nuevos
      {
        new: true,            // Retornar el documento actualizado
        upsert: true,         // Si no existe, lo crea
        setDefaultsOnInsert: true // Aplica defaults si se inserta
      }
    );

    res.status(200).json(savedDoc);
  } catch (error) {
    console.error("❌ Error en replaceAllBitacora:", error);
    res.status(500).json({ message: "Error al guardar los datos de bitácora." });
  }
};


// Actualizar por ID
export const updateDataById = async (req, res) => {
  try {
   if (!updated) {
      return res.status(404).json({ message: "Documento no encontrado para actualizar" });
    }    
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
