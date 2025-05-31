/**
 * @swagger
 * tags:
 *   name: Tokens
 *   description: Token request and validation
 */

var express = require("express");
var router = express.Router();
var tokenController = require("../controllers/tokenController.js");

/**
 * @swagger
 * /tokens:
 *   get:
 *     summary: Default token route
 *     tags: [Tokens]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", tokenController.default);

/**
 * @swagger
 * /tokens/requestToken/{BoxID}:
 *   get:
 *     summary: Request a token for a specific box
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: BoxID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the box to request token for
 *     responses:
 *       200:
 *         description: Token data
 */
router.get("/requestToken/:BoxID", tokenController.requestToken);

module.exports = router;
