import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { verifyToken } from "../utils/jwt.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, "..");

const DOCS_ROUTE = "/api-docs";
const JSON_ROUTE = "/api-docs.json";
const SWAGGER_UI_VERSION = "5.17.14";
const CDN = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}`;

const baseDefinition = {
  openapi: "3.0.3",
  info: {
    title: "LEA_SERVER API",
    version: "1.0.0",
    description: "Documentación de los endpoints de LEA_SERVER (SGC Ambiocom).",
  },
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: { type: "string", example: "Credenciales inválidas" },
          error: { type: "string" },
        },
      },
      Usuario: {
        type: "object",
        properties: {
          id: { type: "string", example: "66f1a2b3c4d5e6f7a8b9c0d1" },
          email: { type: "string", format: "email", example: "operador@ambiocom.com" },
          rol: { type: "string", example: "admin" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  tags: [],
  paths: {},
};

// Se resuelve al generar el spec: dotenv.config() corre después de los imports.
function servers() {
  const list = [{ url: `http://localhost:${process.env.PORT || 4040}`, description: "Local" }];
  if (process.env.PUBLIC_API_URL) {
    list.push({ url: process.env.PUBLIC_API_URL, description: "Producción" });
  }
  return list;
}

/* Introspección del router */

function mountPrefix(layer) {
  if (typeof layer.path === "string" && layer.path) return layer.path;
  const src = layer.regexp?.source ?? "";
  if (!src || src === "^\\/?(?=\\/|$)" || src === "^\\/?$") return "";

  const m = src.match(/^\^\\\/(.*?)\\\/\?\(\?=\\\/\|\\?\$\)$/);
  if (!m) return "";

  return (
    "/" +
    m[1]
      .replace(/\\\//g, "/")
      .replace(/\\\./g, ".")
      .replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ":param")
  );
}

function toOpenApiPath(p) {
  return p
    .replace(/\/:([A-Za-z0-9_]+)\??/g, "/{$1}")
    .replace(/\/+/g, "/")
    .replace(/(.)\/$/, "$1");
}

function pathParams(openApiPath) {
  return [...openApiPath.matchAll(/\{([^}]+)\}/g)].map(([, name]) => ({
    name,
    in: "path",
    required: true,
    schema: { type: "string" },
  }));
}

function tagFor(openApiPath) {
  const segments = openApiPath.split("/").filter(Boolean);
  const idx = segments[0] === "api" ? 1 : 0;
  const raw = segments[idx] ?? "root";
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\{.*?\}/g, "")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "General";
}

function collectRoutes(stack, prefix = "", out = []) {
  for (const layer of stack ?? []) {
    if (layer.route) {
      const routePath = layer.route.path;
      const paths = Array.isArray(routePath) ? routePath : [routePath];
      for (const p of paths) {
        for (const [method, enabled] of Object.entries(layer.route.methods ?? {})) {
          if (!enabled || method === "_all") continue;
          out.push({ method, path: `${prefix}${p}` });
        }
      }
    } else if (layer.name === "router" && layer.handle?.stack) {
      collectRoutes(layer.handle.stack, `${prefix}${mountPrefix(layer)}`, out);
    }
  }
  return out;
}

// En Express 4 el getter `app.router` lanza error de deprecación: _router va primero.
function getRouterStack(app) {
  if (app?._router?.stack) return app._router.stack;
  try {
    if (app?.router?.stack) return app.router.stack;
  } catch {
    /* noop */
  }
  return null;
}

function autoPaths(app) {
  const stack = getRouterStack(app);
  if (!stack) return { paths: {}, tags: [] };

  const paths = {};
  const tags = new Set();

  for (const { method, path: rawPath } of collectRoutes(stack)) {
    const oaPath = toOpenApiPath(rawPath);
    if (oaPath.startsWith(DOCS_ROUTE)) continue;

    const tag = tagFor(oaPath);
    tags.add(tag);

    paths[oaPath] ??= {};
    paths[oaPath][method] = {
      tags: [tag],
      summary: `${method.toUpperCase()} ${oaPath}`,
      description: "Sin documentar. Agrega un bloque `@openapi` en el archivo de rutas.",
      parameters: pathParams(oaPath),
      responses: {
        200: { description: "Operación exitosa" },
        400: { description: "Solicitud inválida" },
        401: { description: "No autenticado" },
        500: { description: "Error del servidor" },
      },
    };
  }

  return { paths, tags: [...tags].sort().map((name) => ({ name })) };
}

/* Anotaciones @openapi (swagger-jsdoc opcional) */

async function jsdocSpec() {
  try {
    const { default: swaggerJsdoc } = await import("swagger-jsdoc");
    return swaggerJsdoc({
      definition: baseDefinition,
      apis: [
        path.join(SRC_DIR, "routes/**/*.js"),
        path.join(SRC_DIR, "controllers/**/*.js"),
        path.join(SRC_DIR, "models/**/*.js"),
      ],
    });
  } catch {
    return null;
  }
}

function mergePaths(auto, annotated) {
  const merged = structuredClone(auto);
  for (const [p, ops] of Object.entries(annotated ?? {})) {
    merged[p] = { ...(merged[p] ?? {}), ...ops };
  }
  return merged;
}

export async function buildSwaggerSpec(app) {
  const { paths, tags } = autoPaths(app);
  const annotated = await jsdocSpec();

  return {
    ...baseDefinition,
    ...(annotated ?? {}),
    info: { ...baseDefinition.info, ...(annotated?.info ?? {}) },
    components: {
      ...baseDefinition.components,
      ...(annotated?.components ?? {}),
      securitySchemes: {
        ...baseDefinition.components.securitySchemes,
        ...(annotated?.components?.securitySchemes ?? {}),
      },
      schemas: {
        ...baseDefinition.components.schemas,
        ...(annotated?.components?.schemas ?? {}),
      },
    },
    servers: servers(),
    tags: annotated?.tags?.length ? annotated.tags : tags,
    paths: mergePaths(paths, annotated?.paths),
  };
}

/* Control de acceso */

function docsDisabled() {
  return String(process.env.DOCS_ENABLED ?? "").toLowerCase() === "false";
}

function allowedRoles() {
  return (process.env.DOCS_ROLES || "admin,developer")
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
}

function safeEqual(a = "", b = "") {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function sessionAllowed(req) {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || "token"];
    if (!token) return false;
    const rol = String(verifyToken(token)?.rol ?? "").toLowerCase();
    return allowedRoles().includes(rol);
  } catch {
    return false;
  }
}

function basicConfigured() {
  return Boolean(process.env.DOCS_USER && process.env.DOCS_PASSWORD);
}

function basicAllowed(req) {
  if (!basicConfigured()) return false;
  const header = req.headers.authorization || "";
  if (!header.toLowerCase().startsWith("basic ")) return false;

  const decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
  const idx = decoded.indexOf(":");
  if (idx === -1) return false;

  // Ambas comparaciones se evalúan siempre, en tiempo constante.
  const okUser = safeEqual(decoded.slice(0, idx), process.env.DOCS_USER);
  const okPass = safeEqual(decoded.slice(idx + 1), process.env.DOCS_PASSWORD);
  return okUser && okPass;
}

export function docsGuard(req, res, next) {
  if (docsDisabled()) return res.status(404).json({ message: "Not found" });
  if (sessionAllowed(req) || basicAllowed(req)) return next();

  if (basicConfigured()) {
    res.set("WWW-Authenticate", 'Basic realm="Restricted", charset="UTF-8"');
  }
  return res.status(401).json({ message: "No autorizado" });
}

/* Montaje */

function fallbackHtml() {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LEA_SERVER API</title>
<link rel="stylesheet" href="${CDN}/swagger-ui.css">
<style>body{margin:0}.topbar{display:none}</style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="${CDN}/swagger-ui-bundle.js" crossorigin></script>
<script src="${CDN}/swagger-ui-standalone-preset.js" crossorigin></script>
<script>
  window.ui = SwaggerUIBundle({
    url: "${JSON_ROUTE}",
    dom_id: "#swagger-ui",
    deepLinking: true,
    docExpansion: "none",
    filter: true,
    tryItOutEnabled: true,
    withCredentials: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "BaseLayout"
  });
</script>
</body>
</html>`;
}

// Debe llamarse después de registrar todas las rutas y antes de app.listen().
export async function setupSwagger(app) {
  if (docsDisabled()) return { docsRoute: null, jsonRoute: null };

  let cached = null;
  const getSpec = async () => (cached ??= await buildSwaggerSpec(app));

  app.get(JSON_ROUTE, docsGuard, async (req, res) => {
    try {
      res.json(await getSpec());
    } catch {
      res.status(500).json({ message: "Error generando el spec" });
    }
  });

  try {
    const { default: swaggerUi } = await import("swagger-ui-express");
    app.use(
      DOCS_ROUTE,
      docsGuard,
      swaggerUi.serve,
      swaggerUi.setup(null, {
        swaggerOptions: { url: JSON_ROUTE, docExpansion: "none", filter: true, withCredentials: true },
        customSiteTitle: "LEA_SERVER API",
      })
    );
  } catch {
    app.get(DOCS_ROUTE, docsGuard, (req, res) => res.type("html").send(fallbackHtml()));
  }

  return { docsRoute: DOCS_ROUTE, jsonRoute: JSON_ROUTE };
}

export default setupSwagger;
