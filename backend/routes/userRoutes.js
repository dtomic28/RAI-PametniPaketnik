/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User registration and authentication
 */

var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController.js");

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Default users route
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", userController.default);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: User registered
 */
router.post("/register", userController.create);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Log out the current user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.get("/logout", userController.logout);

module.exports = router;
