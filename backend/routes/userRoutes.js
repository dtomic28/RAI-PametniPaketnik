/**
 * @swagger
 * tags:
 *   name: User
 *   description: User registration and authentication
 */

var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController.js");

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Default users route
 *     tags: [User]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", userController.default);

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     responses:
 *       201:
 *         description: User registered
 */
router.post("/register", userController.create);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in a user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /user/logout:
 *   get:
 *     summary: Log out the current user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.get("/logout", userController.logout);

/**
 * @swagger
 * /user/usernameExists:
 *   get:
 *     summary: Get a list of all usernames currently in use
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Got all usernames successfully
 */
router.get("/usernameExists/:username", userController.usernameExists);

module.exports = router;
