import InformeAlcohol from "../models/InformesAlcoholModels.js"

// POST /api/informes-alcoholes
export const crearInforme = async (req, res) => {
      console.log("📥 BODY RECIBIDO 👉", req.body); // 👈 PRUEBA DE VIDA

  try {
    const { fecha, zonas, bodegas } = req.body;

    if (!fecha || !zonas) {
      return res.status(400).json({ message: "Fecha y zonas son obligatorias" });
    }

    const nuevo = await InformeAlcohol.create({
      fecha,
      zonas,
      bodegas: bodegas || [],
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error creando informe:", error);
    res.status(500).json({ message: "Error creando informe" });
  }
};

// GET /api/informes-alcoholes
export const listarInformes = async (req, res) => {
  console.log("get disparado");
  
  try {
    const informes = await InformeAlcohol.find(
      {},
      { fecha: 1, createdAt: 1 }
    ).sort({ createdAt: -1 });

    res.json(informes);
  } catch (error) {
    console.error("Error listando informes:", error);
    res.status(500).json({ message: "Error listando informes" });
  }
};

// GET /api/informes-alcoholes/:id
export const obtenerInformePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const informe = await InformeAlcohol.findById(id);

    if (!informe) {
      return res.status(404).json({ message: "Informe no encontrado" });
    }

    res.json(informe);
  } catch (error) {
    console.error("Error obteniendo informe:", error);
    res.status(500).json({ message: "Error obteniendo informe" });
  }
};

// DELETE /api/informes-alcoholes/:id (opcional)
export const eliminarInforme = async (req, res) => {
  try {
    const { id } = req.params;
    await InformeAlcohol.findByIdAndDelete(id);
    res.json({ message: "Informe eliminado" });
  } catch (error) {
    console.error("Error eliminando informe:", error);
    res.status(500).json({ message: "Error eliminando informe" });
  }
};
