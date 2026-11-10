
import axios from "axios";

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

  config.headers.Authorization = `Bearer ${token}`;

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

    const items = data.items || [];

    vacantes.push(...items);
    total = data.pagination?.total ?? vacantes.length;

    if (!items.length) break;

    offset += items.length;

  } while (offset < total);

  return vacantes;
};
