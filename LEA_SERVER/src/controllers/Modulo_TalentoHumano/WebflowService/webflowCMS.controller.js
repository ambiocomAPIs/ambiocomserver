
import {
  listarColeccionesCMS,
  obtenerColeccionCMS,
  listarVacantesCMS,
} from "./webflowCMS.service.js";

export const consultarColeccionesCMS = async (req, res) => {
  try {
    const colecciones = await listarColeccionesCMS();

    return res.status(200).json({
      ok: true,
      total: colecciones.length,
      colecciones,
    });
  } catch (error) {
    console.error(
      "Error consultando colecciones Webflow:",
      error.response?.status || error.message
    );

    return res.status(502).json({
      ok: false,
      message: "No fue posible consultar las colecciones CMS.",
      statusWebflow: error.response?.status || null,
    });
  }
};

export const consultarModeloColeccionCMS = async (req, res) => {
  try {
    const { collectionId } = req.params;

    if (!/^[a-f0-9]{24}$/i.test(collectionId)) {
      return res.status(400).json({
        ok: false,
        message: "ID de colección inválido.",
      });
    }

    const coleccion = await obtenerColeccionCMS(collectionId);

    return res.status(200).json({
      ok: true,
      coleccion,
    });
  } catch (error) {
    console.error(
      "Error consultando modelo Webflow:",
      error.response?.status || error.message
    );

    return res.status(502).json({
      ok: false,
      message: "No fue posible consultar el modelo CMS.",
      statusWebflow: error.response?.status || null,
    });
  }
};



export const consultarVacantesCMS = async (req, res) => {
  try {
    const vacantes = await listarVacantesCMS();

    const activas = vacantes.filter(
      v => v.fieldData?.["vacante-activa"] === true
    ).length;

    return res.status(200).json({
      ok: true,
      total: vacantes.length,
      activas,
      inactivas: vacantes.length - activas,
      vacantes,
    });

  } catch (error) {
    console.error(
      "Error consultando vacantes CMS:",
      error.response?.status || error.message
    );

    return res.status(502).json({
      ok: false,
      message: "No fue posible consultar las vacantes.",
      statusWebflow: error.response?.status || null,
    });
  }
};
