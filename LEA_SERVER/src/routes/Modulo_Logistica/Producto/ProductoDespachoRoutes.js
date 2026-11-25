import { Router } from "express";
import {
  getAllAlcoholes,
  getAlcoholById,
  createAlcohol,
  updateAlcohol,
  deleteAlcohol,
} from "../../../controllers/Modulo_Logistica/Producto/ProductoDespachoControllers.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     AlcoholDespacho:
 *       type: object
 *       description: >
 *         Producto del catálogo que alimenta los despachos. Lo consumen la
 *         planeación diaria, el modal de ingreso de despachos, el maestro de
 *         clientes y el cotizador comercial.
 *       properties:
 *         _id: { type: string, example: "66f1a2b3c4d5e6f7a8b9c0d1" }
 *         nombre:
 *           type: string
 *           maxLength: 120
 *           description: Nombre comercial del producto.
 *           example: "Alcohol etílico rectificado"
 *         tipoProducto:
 *           type: string
 *           maxLength: 100
 *           description: Tipo o categoría. El front lo usa para armar el filtro desplegable.
 *           example: "Rectificado"
 *         origen:
 *           type: string
 *           maxLength: 100
 *           description: Origen del producto.
 *           example: "Nacional"
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

/**
 * @openapi
 * /api/alcoholesdespacho:
 *   get:
 *     tags: [Alcoholesdespacho]
 *     summary: Lista el catálogo de productos
 *     description: >
 *       Devuelve todos los productos ordenados del más reciente al más antiguo.
 *       La respuesta es el arreglo directo, sin envoltorio. Si no hay productos,
 *       devuelve un arreglo vacío.
 *     responses:
 *       200:
 *         description: Catálogo completo.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: "#/components/schemas/AlcoholDespacho" }
 *       500:
 *         description: Error consultando.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.get("/", getAllAlcoholes);

/**
 * @openapi
 * /api/alcoholesdespacho/{id}:
 *   get:
 *     tags: [Alcoholesdespacho]
 *     summary: Obtiene un producto por id
 *     description: >
 *       Devuelve el documento directo, sin envoltorio. Un id con formato
 *       inválido responde 400, no 404.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de Mongo del producto.
 *         example: "66f1a2b3c4d5e6f7a8b9c0d1"
 *     responses:
 *       200:
 *         description: Producto encontrado.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/AlcoholDespacho" }
 *       400:
 *         description: El id no tiene formato de ObjectId válido.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       404:
 *         description: No existe un producto con ese id.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.get("/:id", getAlcoholById);

/**
 * @openapi
 * /api/alcoholesdespacho:
 *   post:
 *     tags: [Alcoholesdespacho]
 *     summary: Crea un producto
 *     description: >
 *       Los tres campos son obligatorios y no pueden ser espacios en blanco; el
 *       servidor recorta los espacios de los extremos antes de guardar. La
 *       combinación de los tres es única, así que no se puede repetir un
 *       producto idéntico.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, tipoProducto, origen]
 *             properties:
 *               nombre: { type: string, maxLength: 120, example: "Alcohol etílico rectificado" }
 *               tipoProducto: { type: string, maxLength: 100, example: "Rectificado" }
 *               origen: { type: string, maxLength: 100, example: "Nacional" }
 *           example:
 *             nombre: "Alcohol etílico rectificado"
 *             tipoProducto: "Rectificado"
 *             origen: "Nacional"
 *     responses:
 *       201:
 *         description: Producto creado. Devuelve el documento completo.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/AlcoholDespacho" }
 *       400:
 *         description: Falta alguno de los tres campos, o excede el largo máximo.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       409:
 *         description: Ya existe un producto con esa misma combinación de nombre, tipo y origen.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       500:
 *         description: Error creando.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.post("/", createAlcohol);

/**
 * @openapi
 * /api/alcoholesdespacho/{id}:
 *   put:
 *     tags: [Alcoholesdespacho]
 *     summary: Actualiza un producto
 *     description: >
 *       Actualización parcial pese a ser PUT: solo se modifican los campos
 *       presentes en el cuerpo, los omitidos se conservan. Enviar una cadena
 *       vacía sí la escribe y hace fallar la validación del modelo.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de Mongo del producto.
 *         example: "66f1a2b3c4d5e6f7a8b9c0d1"
 *     requestBody:
 *       required: true
 *       description: Todos los campos son opcionales; envía solo los que cambian.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string, maxLength: 120, example: "Alcohol etílico extraneutro" }
 *               tipoProducto: { type: string, maxLength: 100, example: "Extraneutro" }
 *               origen: { type: string, maxLength: 100, example: "Importado" }
 *     responses:
 *       200:
 *         description: Producto actualizado. Devuelve el documento ya modificado.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/AlcoholDespacho" }
 *       400:
 *         description: Id inválido, o los datos no pasan la validación del modelo.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       404:
 *         description: No existe un producto con ese id.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       409:
 *         description: El cambio deja una combinación de nombre, tipo y origen que ya existe.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.put("/:id", updateAlcohol);

/**
 * @openapi
 * /api/alcoholesdespacho/{id}:
 *   delete:
 *     tags: [Alcoholesdespacho]
 *     summary: Elimina un producto
 *     description: >
 *       Borrado permanente, sin papelera ni marca de inactivo. No valida si el
 *       producto está referenciado en despachos ya registrados.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de Mongo del producto.
 *         example: "66f1a2b3c4d5e6f7a8b9c0d1"
 *     responses:
 *       200:
 *         description: Producto eliminado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Alcohol eliminado }
 *                 id: { type: string, example: "66f1a2b3c4d5e6f7a8b9c0d1" }
 *       400:
 *         description: El id no tiene formato de ObjectId válido.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       404:
 *         description: No existe un producto con ese id.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.delete("/:id", deleteAlcohol);

export default router;
