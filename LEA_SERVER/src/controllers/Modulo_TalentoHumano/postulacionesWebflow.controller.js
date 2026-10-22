
import { createHmac, timingSafeEqual } from "node:crypto";

import PostulacionLaboral from "../../models/Modulo_TalentoHumano/PostulacionLaboral.js";

/* ===================================================
   OBTENER VALORES DEL FORMULARIO
=================================================== */

const obtenerCampo = (data, ...nombres) => {
  for (const nombre of nombres) {
    const valor = data?.[nombre];

    if (
      valor !== undefined &&
      valor !== null &&
      valor !== ""
    ) {
      return valor;
    }
  }

  return "";
};


/* ===================================================
   OBTENER URL DEL PDF
=================================================== */

const obtenerUrlPDF = (valor) => {
  const archivo = Array.isArray(valor)
    ? valor[0]
    : valor;

  const candidato =
    typeof archivo === "string"
      ? archivo
      : archivo?.url ||
        archivo?.fileUrl ||
        archivo?.href ||
        "";

  if (
    typeof candidato !== "string" ||
    !candidato
  ) {
    return "";
  }

  try {
    const url = new URL(candidato);

    const host = url.hostname.toLowerCase();

    const dominioPermitido =
      host === "webflow.com" ||
      host.endsWith(".webflow.com") ||
      host.endsWith(".website-files.com");

    if (
      url.protocol !== "https:" ||
      !dominioPermitido
    ) {
      return "";
    }

    return url.toString();

  } catch {
    return "";
  }
};


/* ===================================================
   OBTENER CONTENIDO JSON
   Compatible con express.json() y express.raw()
=================================================== */

const obtenerContenidoJSON = (req) => {
  if (Buffer.isBuffer(req.body)) {
    return req.body.toString("utf8");
  }

  if (
    req.body &&
    typeof req.body === "object" &&
    !Array.isArray(req.body)
  ) {
    return JSON.stringify(req.body);
  }

  return null;
};


/* ===================================================
   VALIDAR FIRMA WEBFLOW
   HMAC-SHA256
=================================================== */

const validarFirmaWebflow = (req) => {
  const secret =
    process.env.WEBFLOW_WEBHOOK_SECRET;

  const timestamp =
    req.get("x-webflow-timestamp");

  const firma =
    req.get("x-webflow-signature");

  if (
    !secret ||
    !timestamp ||
    !firma
  ) {
    return false;
  }

  // Timestamp en milisegundos
  if (!/^\d{13}$/.test(timestamp)) {
    return false;
  }

  const tiempo = Number(timestamp);

  if (!Number.isSafeInteger(tiempo)) {
    return false;
  }

  const diferencia = Math.abs(
    Date.now() - tiempo
  );

  // Evitar solicitudes antiguas o futuras
  if (diferencia > 300000) {
    return false;
  }

  // La firma debe ser SHA-256 hexadecimal
  if (!/^[a-f0-9]{64}$/i.test(firma)) {
    return false;
  }

  const contenido = obtenerContenidoJSON(req);

  if (contenido === null) {
    return false;
  }

  const mensaje = `${timestamp}:${contenido}`;

  const firmaEsperada = createHmac(
    "sha256",
    secret
  )
    .update(mensaje, "utf8")
    .digest();

  const firmaRecibida = Buffer.from(
    firma,
    "hex"
  );

  if (
    firmaEsperada.length !== firmaRecibida.length
  ) {
    return false;
  }

  return timingSafeEqual(
    firmaEsperada,
    firmaRecibida
  );
};


/* ===================================================
   CONTROLLER - RECIBIR POSTULACIÓN WEBFLOW
=================================================== */

export const recibirPostulacionWebflow = async (
  req,
  res
) => {
  try {

    /* ===================================================
       1. DIAGNÓSTICO INICIAL
    =================================================== */

    console.log(
      "========== DIAGNÓSTICO WEBFLOW =========="
    );

    console.log(
      "Content-Type:",
      req.get("content-type")
    );

    console.log(
      "Secret configurada:",
      Boolean(process.env.WEBFLOW_WEBHOOK_SECRET)
    );

    console.log(
      "Timestamp presente:",
      Boolean(req.get("x-webflow-timestamp"))
    );

    console.log(
      "Firma presente:",
      Boolean(req.get("x-webflow-signature"))
    );

    console.log(
      "Body es Buffer:",
      Buffer.isBuffer(req.body)
    );

    console.log(
      "Tipo de body:",
      typeof req.body
    );

    console.log(
      "========================================"
    );


    /* ===================================================
       2. VALIDAR FIRMA DEL WEBHOOK
    =================================================== */

    const firmaValida = validarFirmaWebflow(req);

    if (!firmaValida) {

      console.warn(
        "WEBFLOW: Firma no válida o configuración incorrecta"
      );

      return res.status(401).json({
        ok: false,
        message: "Firma Webflow no válida",
      });
    }

    console.log(
      "WEBFLOW: Firma validada correctamente"
    );


    /* ===================================================
       3. INTERPRETAR JSON
    =================================================== */

    let evento;

    try {
      if (Buffer.isBuffer(req.body)) {

        evento = JSON.parse(
          req.body.toString("utf8")
        );

      } else if (
        req.body &&
        typeof req.body === "object" &&
        !Array.isArray(req.body)
      ) {

        evento = req.body;

      } else {
        throw new Error("Body inválido");
      }

      if (
        !evento ||
        typeof evento !== "object" ||
        Array.isArray(evento)
      ) {
        throw new Error("Evento inválido");
      }

    } catch {

      return res.status(400).json({
        ok: false,
        message: "JSON inválido",
      });
    }


    /* ===================================================
       4. VALIDAR TIPO DE EVENTO
    =================================================== */

    if (
      evento.triggerType !==
      "form_submission"
    ) {

      console.log(
        "WEBFLOW: Evento ignorado:",
        evento.triggerType
      );

      return res.status(200).json({
        ok: true,
        ignored: true,
        message: "Evento no corresponde a formulario",
      });
    }

    const payload = evento.payload || {};


    /* ===================================================
       5. DIAGNÓSTICO DEL FORMULARIO
       No imprimir datos personales
    =================================================== */

    console.log(
      "========== POSTULACIÓN WEBFLOW =========="
    );

    console.log(
      "Site ID recibido:",
      payload.siteId
    );

    console.log(
      "Form ID recibido:",
      payload.formId
    );

    console.log(
      "Submission ID:",
      payload.id
    );

    console.log(
      "Fecha:",
      payload.submittedAt
    );

    console.log(
      "Nombre del formulario:",
      payload.name
    );

    console.log(
      "Campos recibidos:",
      Object.keys(payload.data || {})
    );

    console.log(
      "========================================"
    );


    /* ===================================================
       6. VALIDAR SITIO Y FORMULARIO
    =================================================== */

    const siteIdEsperado =
      process.env.WEBFLOW_SITE_ID;

    const formIdEsperado =
      process.env.WEBFLOW_POSTULACIONES_FORM_ID;

    if (
      !siteIdEsperado ||
      !formIdEsperado
    ) {

      console.error(
        "WEBFLOW: Falta configurar Site ID o Form ID"
      );

      return res.status(503).json({
        ok: false,
        message: "Configuración incompleta",
      });
    }

    if (
      payload.siteId !== siteIdEsperado ||
      payload.formId !== formIdEsperado
    ) {

      console.warn(
        "WEBFLOW: Formulario o sitio no autorizado"
      );

      return res.status(200).json({
        ok: true,
        ignored: true,
        message: "Sitio o formulario no corresponde",
      });
    }


    /* ===================================================
       7. VALIDAR IDENTIFICADOR DE POSTULACIÓN
    =================================================== */

    if (
      typeof payload.id !== "string" ||
      !payload.id.trim()
    ) {

      return res.status(400).json({
        ok: false,
        message: "ID de postulación inválido",
      });
    }

    if (
      !payload.data ||
      typeof payload.data !== "object" ||
      Array.isArray(payload.data)
    ) {

      return res.status(400).json({
        ok: false,
        message: "Datos del formulario inválidos",
      });
    }

    const data = payload.data;


    /* ===================================================
       8. EXTRAER DATOS DEL ASPIRANTE
    =================================================== */

    const nombreCompleto = obtenerCampo(
      data,
      "Nombre completo",
      "Nombre Completo",
      "Name"
    );

    const correoPersonal = obtenerCampo(
      data,
      "Correo personal",
      "Correo Personal",
      "Email",
      "Correo electrónico"
    );

    const contactoPersonal = obtenerCampo(
      data,
      "Contacto personal",
      "Contacto Personal",
      "Teléfono",
      "Telefono",
      "Field"
    );

    const expectativasComentarios = obtenerCampo(
      data,
      "Expectativas y comentarios",
      "Expectativas y Comentarios",
      "Comentarios",
      "Field 2"
    );


    /* ===================================================
       9. EXTRAER HOJA DE VIDA PDF
    =================================================== */

    const archivoPDF = obtenerCampo(
      data,
      "Hoja de vida PDF",
      "Hoja de vida (PDF)",
      "Hoja de vida",
      "File"
    );

    const urlPDF = obtenerUrlPDF(
      archivoPDF
    );


    /* ===================================================
       10. EXTRAER DATOS DE LA VACANTE
       CMS WEBFLOW
    =================================================== */

    const tituloVacante = obtenerCampo(
      data,
      "Vacante",
      "Cargo",
      "Titulo Vacante",
      "Título de la vacante",
      "vacante_titulo"
    );

    const ciudad = obtenerCampo(
      data,
      "Ciudad",
      "Ciudad vacante",
      "vacante_ciudad"
    );

    const modalidad = obtenerCampo(
      data,
      "Modalidad",
      "vacante_modalidad"
    );

    const contrato = obtenerCampo(
      data,
      "Contrato",
      "Tipo de contrato",
      "vacante_contrato"
    );


    /* ===================================================
       NUEVOS CAMPOS DEL CMS WEBFLOW
       FECHAS Y ESTADO DE LA VACANTE
    =================================================== */

    const fechaPublicacion = obtenerCampo(
      data,
      "vacante_fecha_publicacion"
    );

    const fechaCierre = obtenerCampo(
      data,
      "vacante_fecha_cierre"
    );

    const vacanteActiva = obtenerCampo(
      data,
      "vacante_activa"
    );


    /* ===================================================
       CONVERTIR FECHAS DEL CMS
    =================================================== */

    const convertirFechaCMS = (valor) => {
      if (!valor) return null;

      const fecha = new Date(valor);

      return Number.isNaN(fecha.getTime())
        ? null
        : fecha;
    };


    /* ===================================================
       CONVERTIR ESTADO ACTIVO DEL CMS
    =================================================== */

    const convertirBooleanoCMS = (valor) => {
      if (typeof valor === "boolean") {
        return valor;
      }

      const texto = String(valor ?? "")
        .trim()
        .toLowerCase();

      if (
        ["true", "1", "yes", "si", "sí"]
          .includes(texto)
      ) {
        return true;
      }

      if (
        ["false", "0", "no"]
          .includes(texto)
      ) {
        return false;
      }

      return null;
    };


    /* ===================================================
       11. DIAGNÓSTICO DEL MAPEO
       Solo presencia de datos, sin valores privados
    =================================================== */

    console.log(
      "========== MAPEO POSTULACIÓN =========="
    );

    console.log(
      "Nombre encontrado:",
      Boolean(nombreCompleto)
    );

    console.log(
      "Correo encontrado:",
      Boolean(correoPersonal)
    );

    console.log(
      "Contacto encontrado:",
      Boolean(contactoPersonal)
    );

    console.log(
      "Comentarios encontrados:",
      Boolean(expectativasComentarios)
    );

    console.log(
      "PDF válido:",
      Boolean(urlPDF)
    );

    console.log(
      "Título vacante encontrado:",
      Boolean(tituloVacante)
    );

    console.log(
      "Ciudad encontrada:",
      Boolean(ciudad)
    );

    console.log(
      "Modalidad encontrada:",
      Boolean(modalidad)
    );

    console.log(
      "Contrato encontrado:",
      Boolean(contrato)
    );

    // Nuevos campos del CMS

    console.log(
      "Fecha publicación encontrada:",
      Boolean(fechaPublicacion)
    );

    console.log(
      "Fecha cierre encontrada:",
      Boolean(fechaCierre)
    );

    console.log(
      "Vacante activa recibida:",
      vacanteActiva !== ""
    );

    console.log(
      "Valor activo interpretado:",
      convertirBooleanoCMS(vacanteActiva)
    );

    console.log(
      "======================================"
    );


    /* ===================================================
       12. PREPARAR FECHA DE POSTULACIÓN
    =================================================== */

    const fechaRecibida = payload.submittedAt
      ? new Date(payload.submittedAt)
      : new Date();

    const fechaPostulacion =
      Number.isNaN(fechaRecibida.getTime())
        ? new Date()
        : fechaRecibida;


    /* ===================================================
       13. PREPARAR DOCUMENTO MONGODB
    =================================================== */

    const nuevaPostulacion = {

      webflowSubmissionId: payload.id,

      webflowSiteId: payload.siteId,

      webflowFormId: payload.formId,

      vacante: {
        titulo: String(tituloVacante),
        ciudad: String(ciudad),
        modalidad: String(modalidad),
        contrato: String(contrato),

        // Nuevos campos del CMS
        fechaPublicacion: convertirFechaCMS(
          fechaPublicacion
        ),

        fechaCierre: convertirFechaCMS(
          fechaCierre
        ),

        activa: convertirBooleanoCMS(
          vacanteActiva
        ),
      },

      aspirante: {
        nombreCompleto: String(nombreCompleto),
        correoPersonal: String(correoPersonal),
        contactoPersonal: String(contactoPersonal),
        expectativasComentarios: String(
          expectativasComentarios
        ),
      },

      hojaVida: {
        urlWebflow: urlPDF,

        estado: urlPDF
          ? "REFERENCIA_RECIBIDA"
          : "PENDIENTE_VERIFICACION",
      },

      fechaPostulacion,

      estado: "RECIBIDA",
    };


    /* ===================================================
       14. GUARDAR SIN DUPLICADOS
    =================================================== */

    const resultado =
      await PostulacionLaboral.updateOne(
        {
          webflowSubmissionId: payload.id,
        },
        {
          $setOnInsert: nuevaPostulacion,
        },
        {
          upsert: true,
          runValidators: true,
        }
      );

    const creada =
      resultado.upsertedCount > 0;

    console.log(
      creada
        ? "WEBFLOW: Postulación registrada en MongoDB"
        : "WEBFLOW: Postulación ya registrada"
    );


    /* ===================================================
       15. RESPUESTA
    =================================================== */

    return res.status(200).json({
      ok: true,

      message: creada
        ? "Postulación registrada"
        : "Postulación ya existente",

      creada,

      webflowSubmissionId: payload.id,
    });

  } catch (error) {

    /* ===================================================
       EVITAR DUPLICADOS POR REINTENTOS
    =================================================== */

    if (error.code === 11000) {

      return res.status(200).json({
        ok: true,
        message: "Postulación ya registrada",
        creada: false,
      });
    }

    console.error(
      "Error al recibir postulación Webflow:",
      error.message
    );

    return res.status(500).json({
      ok: false,
      message: "Error al procesar la postulación",
    });
  }
};
