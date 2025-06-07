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

/**
 * @swagger
 * /item/getItemByID/:itemID:
 *   get:
 *     summary: Gets the item associated with the specified ID, returns false if doesn't exist
 *     tags: [item]
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Item doesn't exist
 */
router.get("/getItemByID/:itemID", itemController.getItemByID)

/**
 * @swagger
 * /item/buyItem/:itemID:
 *   get:
 *     summary: Sells item with itemID to user with userID
 *     tags: [item]
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Failed
 */
router.post("/buyItem", itemController.buyItem)

/**
 * @swagger
 * /item/buyItem/:itemID:
 *   get:
 *     summary: Starts transaction for item
 *     tags: [item]
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Failed
 */
router.post("/sellItem", itemController.sellItem)

/**
 * @swagger
 * /item/storeImage:
 *   get:
 *     summary: Gets image that it stores in /images
 *     tags: [item]
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Failed
 */
router.post("/storeImage", itemController.storeImage)
module.exports = router;
