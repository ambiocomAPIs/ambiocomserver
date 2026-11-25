import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { createUser, updateUser, listUsers, getUser } from "../../controllers/Login/users.controller.js";

const router = Router();

// router.use(requireAuth, requireRole("admin"));

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Lista los usuarios
 *     description: >
 *       Devuelve todos los usuarios sin el hash de contraseña.
 *       Roles permitidos: `admin`, `developer`.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Listado de usuarios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items: { $ref: "#/components/schemas/Usuario" }
 *       401: { description: Sin sesión }
 *       403: { description: El rol de la sesión no tiene permiso }
 */
router.get("/",requireAuth, requireRole("admin", "developer"),listUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene un usuario por id
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de Mongo del usuario.
 *         example: "66f1a2b3c4d5e6f7a8b9c0d1"
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: "#/components/schemas/Usuario" }
 *       401: { description: Sin sesión }
 *       403: { description: El rol de la sesión no tiene permiso }
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.get("/:id",requireAuth, requireRole("admin", "developer"), getUser);

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Crea un usuario
 *     description: >
 *       La contraseña se recibe en texto plano y se guarda hasheada con bcrypt
 *       (nunca se devuelve). Mínimo 8 caracteres. Roles permitidos para llamar: `admin`, `developer`.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, rol]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Debe ser único. Se guarda en minúsculas.
 *                 example: nuevo.usuario@ambiocom.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "ClaveTemporal123"
 *               rol:
 *                 type: string
 *                 description: Rol del usuario, en minúsculas (p. ej. admin, developer, operador).
 *                 example: operador
 *               isActive:
 *                 type: boolean
 *                 description: Opcional. Si no se envía, queda en `true`.
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuario creado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Usuario creado }
 *                 user: { $ref: "#/components/schemas/Usuario" }
 *       400:
 *         description: Faltan campos requeridos o la contraseña tiene menos de 8 caracteres.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       401: { description: Sin sesión }
 *       403: { description: El rol de la sesión no tiene permiso }
 *       409:
 *         description: El email ya existe.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.post("/",requireAuth, requireRole("admin", "developer"), createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualiza un usuario
 *     description: >
 *       Actualización parcial: solo se modifican los campos enviados.
 *       Si se envía `password`, se re-hashea (mínimo 8 caracteres).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: ObjectId de Mongo del usuario.
 *         example: "66f1a2b3c4d5e6f7a8b9c0d1"
 *     requestBody:
 *       required: true
 *       description: Todos los campos son opcionales; envía solo los que cambian.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email, example: usuario.editado@ambiocom.com }
 *               rol: { type: string, example: admin }
 *               isActive: { type: boolean, example: false }
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Opcional. Solo si se quiere cambiar la contraseña.
 *     responses:
 *       200:
 *         description: Usuario actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Usuario actualizado }
 *                 user: { $ref: "#/components/schemas/Usuario" }
 *       400:
 *         description: La contraseña tiene menos de 8 caracteres.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       401: { description: Sin sesión }
 *       403: { description: El rol de la sesión no tiene permiso }
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       409:
 *         description: El email ya existe en otro usuario.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.put("/:id",requireAuth, requireRole("admin", "developer"), updateUser);

export default router;
