import { Router } from "express";
import { login, logout, me } from "../../controllers/Login/auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Inicia sesión
 *     description: >
 *       Valida email y contraseña. Si son correctos, firma un JWT y lo devuelve
 *       en una cookie httpOnly (nombre definido por `COOKIE_NAME`, por defecto `token`).
 *       El front debe enviar las peticiones siguientes con `credentials: "include"`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Se normaliza a minúsculas antes de buscar el usuario.
 *                 example: operador@ambiocom.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MiClaveSegura123"
 *     responses:
 *       200:
 *         description: Login correcto. La cookie de sesión viaja en `Set-Cookie`.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Login OK }
 *                 user:
 *                   type: object
 *                   properties:
 *                     email: { type: string, example: operador@ambiocom.com }
 *                     rol: { type: string, example: admin }
 *       400:
 *         description: Falta email o password.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       401:
 *         description: Credenciales inválidas o usuario inactivo.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 *       500:
 *         description: Error interno.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.post("/login", login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cierra la sesión
 *     description: Borra la cookie de sesión. No recibe body.
 *     responses:
 *       200:
 *         description: Sesión cerrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Logout OK }
 */
router.post("/logout", logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Devuelve el usuario de la sesión actual
 *     description: Lee el JWT de la cookie y devuelve su contenido. Requiere sesión activa.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos del token de sesión.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     email: { type: string, example: operador@ambiocom.com }
 *                     rol: { type: string, example: admin }
 *       401:
 *         description: Sin sesión o token inválido.
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Error" }
 */
router.get("/me", requireAuth, me);

export default router;
