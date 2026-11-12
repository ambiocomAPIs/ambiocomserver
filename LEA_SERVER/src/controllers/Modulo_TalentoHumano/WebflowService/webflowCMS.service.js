
import axios from "axios";
import crypto from "node:crypto";
import FormData from "form-data";

const webflowCMS = axios.create({
  baseURL: "https://api.webflow.com/v2",
  timeout: 15000,
});

webflowCMS.interceptors.request.use((config) => {
  const token =
    process.env.WEBFLOW_API_TOKEN_cocliweb_connection_CMS;

  if (!token) {
    throw new Error("Token CMS de Webflow no configurado.");
  }

  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const listarColeccionesCMS = async () => {
  const siteId = process.env.WEBFLOW_SITE_ID;

  if (!siteId) {
    throw new Error("WEBFLOW_SITE_ID no configurado.");
  }

  const { data } = await webflowCMS.get(
    `/sites/${encodeURIComponent(siteId)}/collections`
  );

  return data.collections || [];
};

export const obtenerColeccionCMS = async (collectionId) => {
  const { data } = await webflowCMS.get(
    `/collections/${encodeURIComponent(collectionId)}`
  );

  return data;
};

export const listarVacantesCMS = async () => {
  const collectionId = process.env.WEBFLOW_CMS_VACANTES_ID;

  if (!collectionId) {
    throw new Error("ID del CMS Vacantes no configurado.");
  }

  const vacantes = [];
  const limit = 100;
  let offset = 0;
  let total = null;

  do {
    const { data } = await webflowCMS.get(
      `/collections/${encodeURIComponent(collectionId)}/items`,
      { params: { limit, offset } }
    );

    console.log("WEBFLOW CMS VACANTES:", {
      collectionId,
      registrosRecibidos: data.items?.length,
      pagination: data.pagination,
      nombres: data.items?.map(v => v.fieldData?.name),
    });

    const items = data.items || [];

    vacantes.push(...items);
    total = data.pagination?.total ?? vacantes.length;

    if (!items.length) break;

    offset += items.length;

  } while (offset < total);

  return vacantes;
};

export const crearVacanteCMS = async (fieldData) => {
  const collectionId = process.env.WEBFLOW_CMS_VACANTES_ID;

  if (!collectionId) {
    throw new Error("ID del CMS Vacantes no configurado.");
  }

  const { data } = await webflowCMS.post(
    `/collections/${encodeURIComponent(collectionId)}/items/insert`,
    {
      items: [
        {
          isDraft: true,
          isArchived: false,
          fieldData,
        },
      ],
    },
    {
      params: {
        skipInvalidFiles: false,
      },
    }
  );

  const vacante = data.items?.[0];

  if (!vacante?.id) {
    throw new Error(
      "Webflow no confirmó la creación de la vacante."
    );
  }

  return vacante;
};


export const actualizarVacanteCMS = async (itemId, fieldData) => {
  const collectionId = process.env.WEBFLOW_CMS_VACANTES_ID;

  if (!collectionId) {
    throw new Error("ID del CMS Vacantes no configurado.");
  }

  const { data } = await webflowCMS.patch(
    `/collections/${encodeURIComponent(collectionId)}/items/${encodeURIComponent(itemId)}`,
    {
      isDraft: true,
      fieldData,
    },
    {
      params: {
        skipInvalidFiles: false,
      },
    }
  );

  return data;
};


export const publicarVacanteCMS = async (itemId) => {
  const collectionId = process.env.WEBFLOW_CMS_VACANTES_ID;

  if (!collectionId) {
    throw new Error("ID del CMS Vacantes no configurado.");
  }

  const { data } = await webflowCMS.post(
    `/collections/${encodeURIComponent(collectionId)}/items/publish`,
    {
      itemIds: [itemId],
    }
  );

  const publicados = data.publishedItemIds || [];
  const errores = data.errors || [];

  if (!publicados.includes(itemId)) {
    const error = new Error(
      "Webflow no confirmó la publicación de la vacante."
    );

    error.statusCode = 502;
    error.detalleWebflow = errores;

    throw error;
  }

  return {
    itemId,
    publicado: true,
    publishedItemIds: publicados,
    errors: errores,
  };
};


export const subirImagenVacanteCMS = async (archivo) => {
  if (!archivo?.buffer?.length) {
    throw new Error("No se recibió una imagen válida.");
  }

  const siteId = process.env.WEBFLOW_SITE_ID;

  if (!siteId) {
    throw new Error("WEBFLOW_SITE_ID no configurado.");
  }

  // Nombre seguro, corto y único para Webflow.
  const extensiones = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const extension = extensiones[archivo.mimetype];

  if (!extension) {
    throw new Error("Formato de imagen no permitido.");
  }

  const nombreArchivo =
    `vacante-${crypto.randomUUID()}.${extension}`;

  // Webflow exige el hash MD5 del archivo.
  const fileHash = crypto
    .createHash("md5")
    .update(archivo.buffer)
    .digest("hex");

  const tokenAssets =
    process.env.WEBFLOW_API_TOKEN_cocliweb_connection_CM_assets;

  if (!tokenAssets) {
    throw new Error("Token de Webflow Assets no configurado.");
  }

  const { data: asset } = await webflowCMS.post(
    `/sites/${encodeURIComponent(siteId)}/assets`,
    {
      fileName: nombreArchivo,
      fileHash,
      size: archivo.size,
    },
    {
      headers: {
        Authorization: `Bearer ${tokenAssets}`,
      },
    }
  );

  if (
    !asset?.id ||
    !asset?.uploadUrl ||
    !asset?.uploadDetails
  ) {
    throw new Error(
      "Webflow no entregó los datos para subir la imagen."
    );
  }

  // PASO 2: Subir el archivo al destino autorizado.
  const formulario = new FormData();

  for (const [clave, valor] of Object.entries(
    asset.uploadDetails
  )) {
    formulario.append(clave, String(valor));
  }

  // El archivo debe agregarse al final.
  formulario.append("file", archivo.buffer, {
    filename: nombreArchivo,
    contentType: archivo.mimetype,
    knownLength: archivo.buffer.length,
  });

  await axios.post(asset.uploadUrl, formulario, {
    headers: formulario.getHeaders(),
    maxBodyLength: 10 * 1024 * 1024,
    timeout: 60000,
  });

  const url = asset.hostedUrl || asset.assetUrl;

  if (!url || !url.startsWith("https://")) {
    throw new Error(
      "Webflow no proporcionó una URL válida para la imagen."
    );
  }

  return {
    fileId: asset.id,
    url,
    alt: archivo.originalname,
  };
};
