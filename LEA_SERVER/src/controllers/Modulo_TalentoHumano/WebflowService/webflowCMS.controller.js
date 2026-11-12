
import {
  listarColeccionesCMS,
  obtenerColeccionCMS,
  listarVacantesCMS,
  crearVacanteCMS,
  actualizarVacanteCMS,
  publicarVacanteCMS,
  subirImagenVacanteCMS
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
    const statusWebflow = error.response?.status || null;
    const detalleWebflow = error.response?.data || null;

    console.error("ERROR CONSULTANDO VACANTES WEBFLOW:", {
      mensaje: error.message,
      codigo: error.code,
      statusWebflow,
      detalleWebflow,
      collectionId: process.env.WEBFLOW_CMS_VACANTES_ID,
    });

    return res.status(502).json({
      ok: false,
      message: "No fue posible consultar las vacantes.",
      statusWebflow,
      ...(process.env.NODE_ENV !== "production" && {
        detalle: detalleWebflow || error.message,
      }),
    });
  }

};

export const registrarVacanteCMS = async (req, res) => {
  try {
    const collectionId = process.env.WEBFLOW_CMS_VACANTES_ID;

    if (!collectionId) {
      return res.status(500).json({
        ok: false,
        message: "La colección VACANTES no está configurada.",
      });
    }

    const { fieldData } = req.body ?? {};

    if (
      !fieldData ||
      typeof fieldData !== "object" ||
      Array.isArray(fieldData)
    ) {
      return res.status(400).json({
        ok: false,
        message: "Debes enviar un objeto fieldData válido.",
      });
    }

    // Consultar el modelo actual de la colección
    const coleccion = await obtenerColeccionCMS(collectionId);
    const fields = coleccion.fields || [];

    if (!fields.length) {
      return res.status(502).json({
        ok: false,
        message: "No fue posible validar el modelo CMS.",
      });
    }

    const camposPermitidos = new Map(
      fields
        .filter(f => f.slug && f.isEditable !== false)
        .map(f => [f.slug, f])
    );

    // Validar que los campos pertenezcan al CMS
    for (const [slug, value] of Object.entries(fieldData)) {
      const field = camposPermitidos.get(slug);

      if (!field) {
        return res.status(400).json({
          ok: false,
          message: `Campo no permitido en el CMS: ${slug}`,
        });
      }

      if (field.type === "Option") {
        const opciones = field.validations?.options || [];

        const valorVacio =
          value === null ||
          value === undefined ||
          value === "";

        if (valorVacio && !field.isRequired) {
          continue;
        }

        if (!opciones.some(o => o.id === value)) {
          return res.status(400).json({
            ok: false,
            message: `Opción inválida para ${field.displayName}.`,
          });
        }
      }


      if (field.type === "Switch" && typeof value !== "boolean") {
        return res.status(400).json({
          ok: false,
          message: `${field.displayName} debe ser verdadero o falso.`,
        });
      }

      if (field.type === "Image" && value != null) {
        if (
          typeof value !== "object" ||
          Array.isArray(value) ||
          typeof value.url !== "string"
        ) {
          return res.status(400).json({
            ok: false,
            message: `Imagen inválida para ${field.displayName}.`,
          });
        }

        try {
          const url = new URL(value.url);
          if (url.protocol !== "https:") {
            throw new Error("Protocolo inválido");
          }
        } catch {
          return res.status(400).json({
            ok: false,
            message: "La imagen necesita una URL HTTPS válida.",
          });
        }
      }
    }

    // Validar campos obligatorios del modelo
    for (const field of fields) {
      if (!field.isRequired || field.isEditable === false) {
        continue;
      }

      const value = fieldData[field.slug];

      const vacio =
        value === undefined ||
        value === null ||
        (typeof value === "string" && !value.trim());

      if (vacio) {
        return res.status(400).json({
          ok: false,
          message: `Campo obligatorio: ${field.displayName}`,
        });
      }
    }

    const name = String(fieldData.name ?? "").trim();
    const slug = String(fieldData.slug ?? "").trim();

    if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return res.status(400).json({
        ok: false,
        message: "El nombre o slug de la vacante es inválido.",
      });
    }

    // Crear el registro en Webflow
    const vacante = await crearVacanteCMS(fieldData);

    return res.status(201).json({
      ok: true,
      message: "Vacante creada correctamente como borrador.",
      vacante,
    });

  } catch (error) {
    const statusWebflow = error.response?.status;
    const detalle = error.response?.data;

    console.error("Error creando vacante Webflow:", {
      statusWebflow,
      detalle: detalle || error.message,
    });


    const erroresConfiguracion = [401, 403, 404];

    const status =
      statusWebflow === 400 || statusWebflow === 409
        ? 422
        : statusWebflow === 429
          ? 503
          : 502;

    const message =
      statusWebflow === 400
        ? "Webflow rechazó los datos de la vacante."
        : statusWebflow === 409
          ? "Conflicto al crear la vacante. Verifica que el slug no exista."
          : statusWebflow === 429
            ? "Webflow alcanzó temporalmente el límite de solicitudes."
            : erroresConfiguracion.includes(statusWebflow)
              ? "No fue posible acceder a la colección de Webflow. Verifica la configuración del CMS."
              : "No fue posible crear la vacante en Webflow.";


    return res.status(status).json({
      ok: false,
      message,
      statusWebflow: statusWebflow || null,
      ...(process.env.NODE_ENV !== "production" && {
        detalle: detalle || error.message,
      }),
    });
  }
};


export const editarVacanteCMS = async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldData } = req.body ?? {};

    if (!/^[a-f0-9]{24}$/i.test(id)) {
      return res.status(400).json({
        ok: false,
        message: "ID de vacante inválido.",
      });
    }

    if (
      !fieldData ||
      typeof fieldData !== "object" ||
      Array.isArray(fieldData) ||
      !Object.keys(fieldData).length
    ) {
      return res.status(400).json({
        ok: false,
        message: "No hay campos válidos para actualizar.",
      });
    }

    const vacante = await actualizarVacanteCMS(id, fieldData);

    return res.status(200).json({
      ok: true,
      message: "Cambios guardados como borrador en Webflow.",
      vacante,
    });
  } catch (error) {
    console.error("Error editando vacante CMS:", {
      statusWebflow: error.response?.status,
      detalle: error.response?.data || error.message,
    });

    return res.status(502).json({
      ok: false,
      message: "No fue posible actualizar la vacante.",
      statusWebflow: error.response?.status || null,
      ...(process.env.NODE_ENV !== "production" && {
        detalle: error.response?.data || error.message,
      }),
    });
  }
};


export const publicarVacanteWebflowCMS = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-f0-9]{24}$/i.test(id)) {
      return res.status(400).json({
        ok: false,
        message: "ID de vacante inválido.",
      });
    }

    const resultado = await publicarVacanteCMS(id);

    return res.status(200).json({
      ok: true,
      message: "Vacante publicada correctamente en Webflow.",
      resultado,
    });

  } catch (error) {
    const statusWebflow = error.response?.status || null;

    console.error("Error publicando vacante Webflow:", {
      id: req.params.id,
      statusWebflow,
      detalle: error.detalleWebflow ||
        error.response?.data ||
        error.message,
    });

    const status =
      statusWebflow === 400 || statusWebflow === 409
        ? 422
        : statusWebflow === 429
          ? 503
          : 502;

    return res.status(status).json({
      ok: false,
      message: "No fue posible publicar la vacante en Webflow.",
      statusWebflow,
      ...(process.env.NODE_ENV !== "production" && {
        detalle: error.detalleWebflow ||
          error.response?.data ||
          error.message,
      }),
    });
  }
};


export const cargarImagenVacanteCMS = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "Debes seleccionar una imagen.",
      });
    }

    const imagen = await subirImagenVacanteCMS(req.file);

    return res.status(200).json({
      ok: true,
      message: "Imagen cargada correctamente a Webflow.",
      imagen,
    });

  } catch (error) {
    console.error("Error subiendo imagen Webflow:", {
      message: error.message,
      statusWebflow: error.response?.status,
      detalle: error.response?.data,
    });

    return res.status(502).json({
      ok: false,
      message: "No fue posible subir la imagen a Webflow.",
      statusWebflow: error.response?.status || null,
      ...(process.env.NODE_ENV !== "production" && {
        detalle: error.response?.data || error.message,
      }),
    });
  }
};
