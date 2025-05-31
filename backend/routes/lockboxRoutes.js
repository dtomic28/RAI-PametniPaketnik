/**
 * @swagger
 * tags:
 *   name: Lockbox
 *   description: Endpoints for managing the lockbox
 */

var express = require("express");
var router = express.Router();
var lockboxController = require("../controllers/lockboxController.js");

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
router.get("/", lockboxController.default);

module.exports = router;
