
import { createHmac, timingSafeEqual, } from "node:crypto";

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


/* ========  VALIDAR FIRMA DEL WEBHOOK WEBFLOW ============ */

const validarFirmaWebflow = (req) => {
  const secret = process.env.WEBFLOW_WEBHOOK_SECRET;

  const timestamp = req.get("x-webflow-timestamp");
  const firma = req.get("x-webflow-signature");

  if (!secret || !timestamp || !firma) {
    return false;
  }

  // Validar timestamp
  if (!/^\d{13}$/.test(timestamp)) {
    return false;
  }

  const diferencia = Math.abs(
    Date.now() - Number(timestamp)
  );

  if (diferencia > 300000) {
    return false;
  }

  // Validar formato de firma
  if (!/^[a-f0-9]{64}$/i.test(firma)) {
    return false;
  }

  // Compatible con express.json() y express.raw()
  let contenido;

  if (Buffer.isBuffer(req.body)) {
    contenido = req.body.toString("utf8");
  } else if (
    req.body &&
    typeof req.body === "object"
  ) {
    contenido = JSON.stringify(req.body);
  } else {
    return false;
  }

  const mensaje = `${timestamp}:${contenido}`;

  const firmaEsperada = createHmac(
    "sha256",
    secret
  )
    .update(mensaje)
    .digest();

  const firmaRecibida = Buffer.from(
    firma,
    "hex"
  );

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

    console.log("========== DIAGNÓSTICO WEBFLOW ==========");

    console.log("Content-Type:", req.get("content-type"));

    console.log(
      "WEBFLOW_WEBHOOK_SECRET configurada:",
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

    console.log("========================================");


    // 1. Validar firma del webhook
    if (!validarFirmaWebflow(req)) {
      return res.status(401).json({
        ok: false,
        message: "Firma Webflow no válida",
      });
    }

    // 2. Interpretar la solicitud JSON
    let evento;

    try {
      evento = JSON.parse(
        req.body.toString("utf8")
      );
    } catch {
      return res.status(400).json({
        ok: false,
        message: "JSON inválido",
      });
    }

    // 3. Validar tipo de evento
    if (
      evento.triggerType !==
      "form_submission"
    ) {
      return res.status(200).json({
        ok: true,
        ignored: true,
      });
    }

    const payload = evento.payload || {};

    // 4. Validar sitio y formulario
    const siteIdEsperado =
      process.env.WEBFLOW_SITE_ID;

    const formIdEsperado =
      process.env.WEBFLOW_POSTULACIONES_FORM_ID;

    if (
      !siteIdEsperado ||
      !formIdEsperado
    ) {
      return res.status(503).json({
        ok: false,
        message: "Configuración incompleta",
      });
    }

    if (
      payload.siteId !== siteIdEsperado ||
      payload.formId !== formIdEsperado
    ) {
      return res.status(200).json({
        ok: true,
        ignored: true,
      });
    }

    // 5. Validar ID de postulación
    if (
      typeof payload.id !== "string" ||
      !payload.id
    ) {
      return res.status(400).json({
        ok: false,
        message: "ID de postulación inválido",
      });
    }

    const data = payload.data || {};

    // 6. Extraer datos del aspirante
    const nombreCompleto = obtenerCampo(
      data,
      "Nombre completo",
      "Name"
    );

    const correoPersonal = obtenerCampo(
      data,
      "Correo personal",
      "Email"
    );

    const contactoPersonal = obtenerCampo(
      data,
      "Contacto personal",
      "Field"
    );

    const expectativasComentarios = obtenerCampo(
      data,
      "Expectativas y comentarios",
      "Field 2"
    );

    // 7. Obtener enlace del archivo PDF
    const archivoPDF = obtenerCampo(
      data,
      "Hoja de vida PDF",
      "Hoja de vida (PDF)",
      "File"
    );

    const urlPDF = obtenerUrlPDF(
      archivoPDF
    );

    // 8. Extraer información de la vacante
    const tituloVacante = obtenerCampo(
      data,
      "Vacante",
      "Cargo"
    );

    const ciudad = obtenerCampo(
      data,
      "Ciudad"
    );

    const modalidad = obtenerCampo(
      data,
      "Modalidad"
    );

    const contrato = obtenerCampo(
      data,
      "Contrato"
    );

    // 9. Preparar documento MongoDB
    const nuevaPostulacion = {
      webflowSubmissionId: payload.id,

      webflowSiteId: payload.siteId,

      webflowFormId: payload.formId,

      vacante: {
        titulo: String(tituloVacante),
        ciudad: String(ciudad),
        modalidad: String(modalidad),
        contrato: String(contrato),
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

      fechaPostulacion: payload.submittedAt
        ? new Date(payload.submittedAt)
        : new Date(),

      estado: "RECIBIDA",
    };

    // 10. Registrar sin duplicar postulaciones
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
        }
      );

    const creada =
      resultado.upsertedCount > 0;

    return res.status(200).json({
      ok: true,

      message: creada
        ? "Postulación registrada"
        : "Postulación ya existente",

      creada,
    });

  } catch (error) {

    // Evitar fallos por reintentos simultáneos
    if (error.code === 11000) {
      return res.status(200).json({
        ok: true,
        message: "Postulación ya registrada",
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
