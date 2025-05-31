/**
 * @swagger
 * tags:
 *   name: Token
 *   description: Token request and validation
 */

var express = require("express");
var router = express.Router();
var tokenController = require("../controllers/tokenController.js");

/**
 * @swagger
 * /token:
 *   get:
 *     summary: Default token route
 *     tags: [Token]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", tokenController.default);

/**
 * @swagger
 * /token/requestToken/{BoxID}:
 *   get:
 *     summary: Request a token for a specific box
 *     tags: [Token]
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
