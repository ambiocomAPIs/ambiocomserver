import { Router } from "express";
import {
  createAguaAnalisis,
  getAguaAnalisisByDate,
  getLatestAguaAnalisis,
  updateAguaAnalisis,
} from "../../controllers/ModuloLaboratorio/LAB_FO_XX_aguaAnalisis.controller.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     AguaAnalisisFila:
 *       type: object
 *       description: >
 *         Una fila de la tabla del formato LAB-FO-027. Las columnas se guardan como
 *         `col_0` … `col_22` y todos los valores viajan como texto, tal como se
 *         escriben en la planilla. Un valor vacío, `N.A` o `-` significa que el
 *         parámetro no se analizó en esa muestra.
 *       properties:
 *         col_0:  { type: string, description: Código de muestra, example: "M-01" }
 *         col_1:  { type: string, description: Tipo de agua, example: "Agua cruda" }
 *         col_2:  { type: string, description: Color aparente (UPC), example: "12" }
 *         col_3:  { type: string, description: Turbiedad (UNT), example: "0.85" }
 *         col_4:  { type: string, description: Conductividad (us/cm), example: "145" }
 *         col_5:  { type: string, description: pH, example: "7.2" }
 *         col_6:  { type: string, description: mL EDTA, example: "1.5" }
 *         col_7:  { type: string, description: Concentración EDTA, example: "0.02" }
 *         col_8:  { type: string, description: Dureza (mg/L), example: "30" }
 *         col_9:  { type: string, description: mL HCl, example: "2.0" }
 *         col_10: { type: string, description: Concentración HCl, example: "0.02" }
 *         col_11: { type: string, description: Alcalinidad (mg/L), example: "40" }
 *         col_12: { type: string, description: mL FAS, example: "0.5" }
 *         col_13: { type: string, description: Concentración FAS, example: "0.01" }
 *         col_14: { type: string, description: Cloro libre (mg/L), example: "0.8" }
 *         col_15: { type: string, description: Sílice (mg/L), example: "5" }
 *         col_16: { type: string, description: Residual de fosfatos (ppm), example: "2" }
 *         col_17: { type: string, description: SDT, example: "90" }
 *         col_18: { type: string, description: Hierro (ppm), example: "0.1" }
 *         col_19: { type: string, description: Nitritos (ppm), example: "0.02" }
 *         col_20:
 *           type: string
 *           description: >
 *             Cumplimiento de la fila. Lo calcula el front comparando cada celda
 *             contra el rango permitido del tipo de muestra, antes de enviar.
 *           enum: ["SI", "NO", ""]
 *           example: "SI"
 *         col_21: { type: string, description: Analista responsable, example: "J. Pérez" }
 *         col_22:
 *           type: string
 *           description: >
 *             Observaciones. Lo calcula el front: lista los parámetros fuera de
 *             rango separados por coma. Vacío si todo cumple.
 *           example: "Turbiedad, pH"
 *
 *     ResumenAnalisis:
 *       type: object
 *       description: Conteo de cumplimiento del día. Lo calcula el front antes de enviar.
 *       properties:
 *         datosAnalizados: { type: integer, description: Total de celdas con valor numérico válido, example: 48 }
 *         cumplen: { type: integer, example: 45 }
 *         noCumplen: { type: integer, example: 3 }
 *         rate: { type: number, format: float, description: Porcentaje de cumplimiento, example: 93.75 }
 *         rateTexto: { type: string, example: "93.75%" }
 *
 *     AguaAnalisisRegistro:
 *       type: object
 *       description: Registro completo tal como lo devuelve la base de datos.
 *       properties:
 *         _id: { type: string, example: "66f1a2b3c4d5e6f7a8b9c0d1" }
 *         formato: { type: string, default: "LAB-FO-027", example: "LAB-FO-027" }
 *         version: { type: string, default: "15", example: "15" }
 *         pagina: { type: string, default: "1-1", example: "1-1" }
 *         tabla: { type: string, default: "Análisis de agua", example: "Análisis de agua" }
 *         fechaRegistro:
 *           type: string
 *           description: Fecha del registro en formato DD-MM-YYYY. Es única, no puede repetirse.
 *           example: "23-11-2026"
 *         fechaRegistroISO:
 *           type: string
 *           format: date-time
 *           description: Misma fecha en ISO. La deriva el servidor desde `fechaRegistro`.
 *           example: "2026-11-23T00:00:00.000Z"
 *         data:
 *           type: array
 *           items: { $ref: "#/components/schemas/AguaAnalisisFila" }
 *         resumenAnalisis: { $ref: "#/components/schemas/ResumenAnalisis" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

/**
 * @openapi
 * /api/agua-analisis/latest:
 *   get:
 *     tags: [Agua Analisis]
 *     summary: Devuelve el registro más reciente
 *     description: >
 *       Ordena por `fechaRegistroISO` descendente y devuelve el primero.
 *       Sirve para precargar la planilla con el último día guardado.
 *       Si la colección está vacía, responde 200 con `data: null`.
 *     responses:
 *       200:
 *         description: Último registro, o `null` si no hay ninguno.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 data:
 *                   nullable: true
 *                   allOf:
 *                     - $ref: "#/components/schemas/AguaAnalisisRegistro"
 *       500:
 *         description: Error consultando.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.get("/latest", getLatestAguaAnalisis);

/**
 * @openapi
 * /api/agua-analisis/by-date:
 *   get:
 *     tags: [Agua Analisis]
 *     summary: Devuelve el registro de una fecha y el del día anterior
 *     description: >
 *       Busca el registro de la fecha pedida y además el del día previo, que la
 *       planilla muestra como referencia. Cualquiera de los dos puede venir en
 *       `null` si no existe; eso no es error, responde 200 igual.
 *     parameters:
 *       - name: fecha
 *         in: query
 *         required: true
 *         schema: { type: string, pattern: '^\d{2}-\d{2}-\d{4}$' }
 *         description: Fecha en formato DD-MM-YYYY.
 *         example: "23-11-2026"
 *     responses:
 *       200:
 *         description: Registro de la fecha y del día anterior.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 fechaActual: { type: string, example: "23-11-2026" }
 *                 fechaAnterior: { type: string, description: Calculada por el servidor, example: "22-11-2026" }
 *                 actual:
 *                   nullable: true
 *                   allOf:
 *                     - $ref: "#/components/schemas/AguaAnalisisRegistro"
 *                 anterior:
 *                   nullable: true
 *                   allOf:
 *                     - $ref: "#/components/schemas/AguaAnalisisRegistro"
 *                 data:
 *                   type: array
 *                   nullable: true
 *                   description: Atajo a `actual.data`.
 *                   items: { $ref: "#/components/schemas/AguaAnalisisFila" }
 *                 dataDiaAnterior:
 *                   type: array
 *                   nullable: true
 *                   description: Atajo a `anterior.data`.
 *                   items: { $ref: "#/components/schemas/AguaAnalisisFila" }
 *                 id:
 *                   type: string
 *                   nullable: true
 *                   description: Id del registro actual. El front lo usa para decidir si crea o actualiza.
 *                   example: "66f1a2b3c4d5e6f7a8b9c0d1"
 *       400:
 *         description: Falta el parámetro `fecha`.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       500:
 *         description: Error consultando.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.get("/by-date", getAguaAnalisisByDate);

/**
 * @openapi
 * /api/agua-analisis:
 *   post:
 *     tags: [Agua Analisis]
 *     summary: Crea el registro de un día
 *     description: >
 *       Guarda la planilla completa de una fecha. Solo puede existir un registro
 *       por fecha; si ya hay uno, responde 409 con su id para que el front use
 *       PATCH en lugar de crear. El servidor deriva `fechaRegistroISO` desde
 *       `fechaRegistro`, no hay que enviarla.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fechaRegistro, data]
 *             properties:
 *               fechaRegistro:
 *                 type: string
 *                 pattern: '^\d{2}-\d{2}-\d{4}$'
 *                 description: Fecha en formato DD-MM-YYYY. Única por registro.
 *                 example: "23-11-2026"
 *               data:
 *                 type: array
 *                 description: Filas de la planilla. Debe ser un array, aunque venga vacío.
 *                 items: { $ref: "#/components/schemas/AguaAnalisisFila" }
 *               resumenAnalisis: { $ref: "#/components/schemas/ResumenAnalisis" }
 *               formato: { type: string, description: Opcional. Por defecto "LAB-FO-027", example: "LAB-FO-027" }
 *               version: { type: string, description: Opcional. Por defecto "15", example: "15" }
 *               pagina: { type: string, description: Opcional. Por defecto "1-1", example: "1-1" }
 *               tabla: { type: string, description: Opcional. Por defecto "Análisis de agua", example: "Análisis de agua" }
 *           example:
 *             fechaRegistro: "23-11-2026"
 *             formato: "LAB-FO-027"
 *             version: "15"
 *             pagina: "1-1"
 *             tabla: "Análisis de agua"
 *             data:
 *               - col_0: "M-01"
 *                 col_1: "Agua cruda"
 *                 col_2: "12"
 *                 col_3: "0.85"
 *                 col_4: "145"
 *                 col_5: "7.2"
 *                 col_8: "30"
 *                 col_11: "40"
 *                 col_14: "0.8"
 *                 col_20: "SI"
 *                 col_21: "J. Pérez"
 *                 col_22: ""
 *             resumenAnalisis:
 *               datosAnalizados: 48
 *               cumplen: 45
 *               noCumplen: 3
 *               rate: 93.75
 *               rateTexto: "93.75%"
 *     responses:
 *       201:
 *         description: Registro creado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 message: { type: string, example: Registro creado correctamente }
 *                 data: { $ref: "#/components/schemas/AguaAnalisisRegistro" }
 *                 id: { type: string, example: "66f1a2b3c4d5e6f7a8b9c0d1" }
 *       400:
 *         description: Falta `fechaRegistro`, o `data` no es un array.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       409:
 *         description: Ya existe un registro para esa fecha. Devuelve su id.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: false }
 *                 message: { type: string, example: Ya existe un registro para esta fecha }
 *                 id: { type: string, example: "66f1a2b3c4d5e6f7a8b9c0d1" }
 *       500:
 *         description: Error creando.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.post("/", createAguaAnalisis);

/**
 * @openapi
 * /api/agua-analisis/{id}:
 *   patch:
 *     tags: [Agua Analisis]
 *     summary: Actualiza un registro existente
 *     description: >
 *       Actualiza por id con los campos enviados. Si se manda `fechaRegistro`,
 *       el servidor recalcula `fechaRegistroISO`. Corre las validaciones del
 *       modelo, así que cambiar la fecha a una ya ocupada falla por índice único.
 *       En la práctica el front manda el payload completo, igual que en POST.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId del registro.
 *         example: "66f1a2b3c4d5e6f7a8b9c0d1"
 *     requestBody:
 *       required: true
 *       description: Todos los campos son opcionales; se actualizan solo los enviados.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaRegistro: { type: string, pattern: '^\d{2}-\d{2}-\d{4}$', example: "23-11-2026" }
 *               data:
 *                 type: array
 *                 items: { $ref: "#/components/schemas/AguaAnalisisFila" }
 *               resumenAnalisis: { $ref: "#/components/schemas/ResumenAnalisis" }
 *               formato: { type: string, example: "LAB-FO-027" }
 *               version: { type: string, example: "15" }
 *               pagina: { type: string, example: "1-1" }
 *               tabla: { type: string, example: "Análisis de agua" }
 *     responses:
 *       200:
 *         description: Registro actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 message: { type: string, example: Registro actualizado correctamente }
 *                 data: { $ref: "#/components/schemas/AguaAnalisisRegistro" }
 *                 id: { type: string, example: "66f1a2b3c4d5e6f7a8b9c0d1" }
 *       404:
 *         description: No existe un registro con ese id.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       500:
 *         description: Error actualizando.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.patch("/:id", updateAguaAnalisis);

/**
 * @openapi
 * /api/agua-analisis/{id}:
 *   put:
 *     tags: [Agua Analisis]
 *     summary: Actualiza un registro existente (alias de PATCH)
 *     description: >
 *       Usa el mismo controlador que PATCH y se comporta igual: actualización
 *       parcial, no reemplazo. Se mantiene por compatibilidad.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         example: "66f1a2b3c4d5e6f7a8b9c0d1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaRegistro: { type: string, pattern: '^\d{2}-\d{2}-\d{4}$', example: "23-11-2026" }
 *               data:
 *                 type: array
 *                 items: { $ref: "#/components/schemas/AguaAnalisisFila" }
 *               resumenAnalisis: { $ref: "#/components/schemas/ResumenAnalisis" }
 *     responses:
 *       200:
 *         description: Registro actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *                 message: { type: string, example: Registro actualizado correctamente }
 *                 data: { $ref: "#/components/schemas/AguaAnalisisRegistro" }
 *                 id: { type: string, example: "66f1a2b3c4d5e6f7a8b9c0d1" }
 *       404:
 *         description: No existe un registro con ese id.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       500:
 *         description: Error actualizando.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.put("/:id", updateAguaAnalisis);

export default router;
