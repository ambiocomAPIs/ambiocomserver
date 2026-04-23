import Tutorial from "../../models/ModalTutorialList/TutorialModalListModel.js";

export const crearTutorial = async (req, res) => {
  try {
    const { titulo, link, descripcion, modulo } = req.body;

    if (!titulo || !link || !descripcion || !modulo) {
      return res.status(400).json({
        ok: false,
        msg: "Todos los campos son obligatorios: titulo, link, descripcion, modulo",
      });
    }

    const nuevoTutorial = new Tutorial({
      titulo,
      link,
      descripcion,
      modulo: modulo.toLowerCase().trim(),
    });

    const tutorialGuardado = await nuevoTutorial.save();

    return res.status(201).json({
      ok: true,
      msg: "Tutorial creado correctamente",
      data: tutorialGuardado,
    });
  } catch (error) {
    console.error("Error al crear tutorial:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor al crear tutorial",
      error: error.message,
    });
  }
};

export const obtenerTutoriales = async (req, res) => {
  try {
    const { modulo } = req.query;

    const filtro = {};

    if (modulo) {
      filtro.modulo = modulo.toLowerCase().trim();
    }

    const tutoriales = await Tutorial.find(filtro).sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      total: tutoriales.length,
      data: tutoriales,
    });
  } catch (error) {
    console.error("Error al obtener tutoriales:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor al obtener tutoriales",
      error: error.message,
    });
  }
};


export const obtenerTutorialPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const tutorial = await Tutorial.findById(id);

    if (!tutorial) {
      return res.status(404).json({
        ok: false,
        msg: "Tutorial no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: tutorial,
    });
  } catch (error) {
    console.error("Error al obtener tutorial por id:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor al obtener tutorial",
      error: error.message,
    });
  }
};


export const actualizarTutorial = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, link, descripcion, modulo } = req.body;

    const tutorialActualizado = await Tutorial.findByIdAndUpdate(
      id,
      {
        titulo,
        link,
        descripcion,
        modulo: modulo?.toLowerCase().trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tutorialActualizado) {
      return res.status(404).json({
        ok: false,
        msg: "Tutorial no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      msg: "Tutorial actualizado correctamente",
      data: tutorialActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar tutorial:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor al actualizar tutorial",
      error: error.message,
    });
  }
};


export const eliminarTutorial = async (req, res) => {
  try {
    const { id } = req.params;

    const tutorialEliminado = await Tutorial.findByIdAndDelete(id);

    if (!tutorialEliminado) {
      return res.status(404).json({
        ok: false,
        msg: "Tutorial no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      msg: "Tutorial eliminado correctamente",
      data: tutorialEliminado,
    });
  } catch (error) {
    console.error("Error al eliminar tutorial:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error del servidor al eliminar tutorial",
      error: error.message,
    });
  }
};