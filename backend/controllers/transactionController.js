const TransactionModel = require("../models/transactionModel");
const UserModel = require("../models/userModel");
const LockboxModel = require("../models/lockboxModel");
const ItemModel = require("../models/itemModel");

// GET /transaction
function defaultHandler(req, res) {
  res.json({ message: "default function in transactionController" });
}

// GET /transaction/completed
async function getAllCompletedTransactions(req, res) {
  try {
    const transactions = await TransactionModel.find({
      finishedSellingTime: { $ne: null },
    })
      .populate("sellerID")
      .populate("buyerID")
      .populate("itemID")
      .exec();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /transaction/open
async function getAllOpenTransactions(req, res) {
  try {
    const transactions = await TransactionModel.find({
      finishedSellingTime: null,
    })
      .populate("sellerID")
      .populate("buyerID")
      .populate("itemID")
      .exec();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /transaction/unwanted
async function getUnwantedTransactions(req, res) {
  try {
    const transactions = await TransactionModel.find({
      finishedSellingTime: null,
      startedSellingTime: {
        $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      }, // 30 days
    })
      .populate("sellerID")
      .populate("buyerID")
      .populate("itemID")
      .exec();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /transaction/byLockbox/:id
async function getTransactionByID(req, res) {
  try {
    const transactions = await TransactionModel.find({
      lockboxID: req.params.id,
    })
      .populate("sellerID")
      .populate("buyerID")
      .populate("itemID")
      .exec();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTransactionByItemID(req, res) {
  try {
    const transactions = await TransactionModel.find({
      itemID: req.params.id,
    })
      .populate("lockboxID")
      .populate("sellerID")
      .populate("buyerID")
      .populate("itemID")
      .exec();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  default: defaultHandler,
  getAllCompletedTransactions,
  getAllOpenTransactions,
  getUnwantedTransactions,
  getTransactionByID,
};
