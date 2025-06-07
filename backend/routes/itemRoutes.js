/**
 * @swagger
 * tags:
 *   name: Item
 *   description: Item
 */

var express = require("express");
var router = express.Router();
var itemController = require("../controllers/itemController.js");
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

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
router.post("/", upload.single("image"), itemController.createItem);
router.put("/:id", upload.single("image"), itemController.updateItem);
router.delete("/:id", itemController.deleteItem);

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


module.exports = router;
