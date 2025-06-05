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

// GET /transaction/open
async function getAllOpenTransactions(req, res) {
  try {
    const transactions = await TransactionModel.find({
      finishedSellingTime: null,
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

// GET /transaction/unwanted
async function getUnwantedTransactions(req, res) {
  try {
    const transactions = await TransactionModel.find({
      finishedSellingTime: null,
      startedSellingTime: {
        $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      }, // 30 days
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

// GET /transaction/byLockbox/:id
async function getTransactionByID(req, res) {
  try {
    const transactions = await TransactionModel.find({
      lockboxID: req.params.id,
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

//UPDATE /transaction/:id

async function updateTransaction(req, res) {
  try {
    const transactionId = req.params.id;
    const updateData = req.body;

    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      transactionId,
      updateData,
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (updatedTransaction.finishedSellingTime== null) {
      await LockboxModel.findByIdAndUpdate(
        updatedTransaction.lockboxID,
        {
          lastOpenedTime: updatedTransaction.startedSellingTime,
          lastOpenedPerson: updatedTransaction.sellerID,
          storedItem: updatedTransaction.itemID,
        }
      );
    } else {
      await LockboxModel.findByIdAndUpdate(
        updatedTransaction.lockboxID,
        {
          lastOpenedTime: updatedTransaction.finishedSellingTime,
          lastOpenedPerson: updatedTransaction.buyerID,
          storedItem: null,
        }
      );

       await ItemModel.findByIdAndUpdate(
        updatedTransaction.itemID,
        { isSelling: false }
      );
    }

    res.json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }


}

// POST /transaction
async function createTransaction(req, res) {
  try {
    const newTransaction = new TransactionModel({
      lockboxID: req.body.lockboxID,
      sellerID: req.body.sellerID,
      buyerID: req.body.buyerID,
      itemID: req.body.itemID,
      startedSellingTime: req.body.startedSellingTime || new Date(),
      finishedSellingTime: req.body.finishedSellingTime || null,
    });

    const transaction = await newTransaction.save();

    if (transaction.finishedSellingTime == null) {
      await LockboxModel.findByIdAndUpdate(
        transaction.lockboxID,
        {
          lastOpenedTime: startedSellingTime ,
          lastOpenedPerson: transaction.sellerID,
          storedItem: transaction.itemID,
        }
      );
    } else {
      await LockboxModel.findByIdAndUpdate(
        transaction.lockboxID,
        {
          lastOpenedTime: transaction.finishedSellingTime,
          lastOpenedPerson: transaction.buyerID,
          storedItem: null,
        }
      );

      await ItemModel.findByIdAndUpdate(
        transaction.itemID,
        { isSelling: false }
      );
    }

    res.status(201).json(transaction);
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
  updateTransaction,
  createTransaction,
};
