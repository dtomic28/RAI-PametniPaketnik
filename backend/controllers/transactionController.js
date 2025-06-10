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
    const box = await LockboxModel.find({
      boxID:req.params.id,
  });

    const transactions = await TransactionModel.find({
      lockboxID: box[0]._id,
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

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === "") {
        updateData[key] = null;
      }
    });

    const transaction = await TransactionModel.findById(transactionId);

    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      transactionId,
      updateData,
      { new: true }
    );

    if (!updatedTransaction) {
  return res.status(404).json({ error: "Transaction not found" });
}
    if(transaction.sellerID.toString() !== updatedTransaction.sellerID.toString()) {
      await UserModel.findByIdAndUpdate(
        updatedTransaction.sellerID,
        { $inc: { numberOfTransactions: 1 } } 
      );

      await UserModel.findByIdAndUpdate(
        transaction.sellerID,
        { $inc: { numberOfTransactions: -1 } } 
      );
    }

    if(transaction.buyerID.toString() !== updatedTransaction.buyerID.toString()) {
      await UserModel.findByIdAndUpdate(
        updatedTransaction.buyerID,
        { $inc: { numberOfTransactions: 1 } } 
      );

      await UserModel.findByIdAndUpdate(
        transaction.buyerID,
        { $inc: { numberOfTransactions: -1 } } 
      );
    }

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
    console.error("Error updating transaction:", err);
    res.status(500).json({ error: err.message });
  }


}

// POST /transaction
async function createTransaction(req, res) {
  try {
    const newTransaction = new TransactionModel({
      lockboxID: req.body.lockboxID || null,
      sellerID: req.body.sellerID   || null,
      buyerID: req.body.buyerID || null,
      itemID: req.body.itemID || null,
      startedSellingTime: req.body.startedSellingTime || new Date(),
      finishedSellingTime: req.body.finishedSellingTime || null,
    });

    const transaction = await newTransaction.save();

    if(newTransaction.sellerID !== null) {
      await UserModel.findByIdAndUpdate(
        transaction.sellerID,
        { $inc: { numberOfTransactions: 1 } } 
      );
    }

    if (newTransaction.buyerID !== null) {
      await UserModel.findByIdAndUpdate(
        transaction.buyerID,
        { $inc: { numberOfTransactions: 1 } } 
      );
    }

    if (transaction.finishedSellingTime == null) {
      await LockboxModel.findByIdAndUpdate(
        transaction.lockboxID,
        {
          lastOpenedTime: transaction.startedSellingTime ,
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
    console.error("Error creating transaction:", err);
    res.status(500).json({ error: err.message });
  }
}

// GET /transaction/historyByID/:id
async function getTransactionHistory(req, res) {
  try {
    const username = req.params.id;
    // Find the user by username
    const user = await UserModel.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = user._id;
    const transactions = await TransactionModel.find({
      $or: [
        { sellerID: userId },
        { buyerID: userId }
      ]
    })
      .populate("itemID")
      .exec();

    const items = transactions
      .map(tx => tx.itemID)
      .filter(item => item != null);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /transaction/activebyID/:id
async function getActiveTransactions(req, res) {
  try {
    const username = req.params.id;
    // Find the user by username
    const user = await UserModel.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = user._id;
    const transactions = await TransactionModel.find({
      sellerID: userId,
      finishedSellingTime: null
    })
      .populate("itemID")
      .exec();

    const items = transactions
      .map(tx => tx.itemID)
      .filter(item => item != null && item.isSelling);

    res.json(items);
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
  getTransactionHistory,
  getActiveTransactions,
};