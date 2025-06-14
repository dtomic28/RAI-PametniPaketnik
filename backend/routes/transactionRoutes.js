/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Endpoints for handling item transactions
 */

var express = require("express");
var router = express.Router();
var transactionController = require("../controllers/transactionController.js");

/**
 * @swagger
 * /transaction:
 *   get:
 *     summary: Default transaction route
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", transactionController.default);

/**
 * @swagger
 * /transaction/getCompleted:
 *   get:
 *     summary: Get all completed transactions
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: List of completed transactions
 */
router.get("/getCompleted", transactionController.getAllCompletedTransactions);

/**
 * @swagger
 * /transaction/getOpen:
 *   get:
 *     summary: Get all open transactions
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: List of open transactions
 */
router.get("/getOpen", transactionController.getAllOpenTransactions);

/**
 * @swagger
 * /transaction/getUnwanted:
 *   get:
 *     summary: Get all unwanted transactions
 *     tags: [Transaction]
 *     responses:
 *       200:
 *         description: List of unwanted transactions
 */
router.get("/getUnwanted", transactionController.getUnwantedTransactions);

/**
 * @swagger
 * /transaction/getByBoxID/{id}:
 *   get:
 *     summary: Get transaction by Box ID
 *     tags: [Transaction]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Box ID to look up
 *     responses:
 *       200:
 *         description: Transaction data
 */
router.get("/getByBoxID/:id", transactionController.getTransactionByID);

router.post("/", transactionController.createTransaction);

router.put("/:id", transactionController.updateTransaction);

router.get("/transaction/historyByUsername/:id", transactionController.getTransactionHistory)

router.get("/transaction/activeByUsername/:id", transactionController.getActiveTransactions)
module.exports = router;
