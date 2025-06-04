/**
 * @swagger
 * tags:
 *   name: Item
 *   description: Item
 */

var express = require("express");
var router = express.Router();
var itemController = require("../controllers/itemController.js");

/**
 * @swagger
 * /item:
 *   get:
 *     summary: Default items route
 *     tags: [User]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", itemController.default);

/**
 * @swagger
 * /item/getSellingItems:
 *   get:
 *     summary: Gets all items currently being sold
 *     tags: [item]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/getSellingItems", itemController.getSellingItems);


module.exports = router;
