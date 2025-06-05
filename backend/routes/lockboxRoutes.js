/**
 * @swagger
 * tags:
 *   name: Lockbox
 *   description: Endpoints for managing the lockbox
 */
var express = require("express");
var router = express.Router();
var lockboxController = require("../controllers/lockboxController.js");
const { authenticateJWT } = require("../middleware/auth");

/**
 * @swagger
 * /lockbox:
 *   get:
 *     summary: Default lockbox route
 *     tags: [Lockbox]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", authenticateJWT, lockboxController.default); //An example how to use protected route.
router.get("/all", lockboxController.getAllLockboxes);

module.exports = router;
