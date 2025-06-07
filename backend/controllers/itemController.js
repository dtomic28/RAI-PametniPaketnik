const ItemModel = require("../models/itemModel.js");
const LockboxModel = require('../models/lockboxModel');
const jwt = require("jsonwebtoken");
const { isUsernameAllowedByOrv } = require("../utils/orvValidator");
const TransactionModel = require('../models/transactionModel');
const UserModel = require('../models/userModel');

// GET /user
function defaultHandler(req, res) {
  for (let i = 0; i < 5; i++) {
    const testItem = new ItemModel({
      name: `Test Item ${i + 1}`,
      description: "This is a test item.",
      price: 10.99,
      isSelling: true,
      imageLink: "images/default.jpg",
    });
    testItem.save().catch(() => {});
  }

  res.json({ message: "default function in itemController" });
}

function getSellingItems(req, res) {
    ItemModel.find({ isSelling: true })
        .then(items => res.json(items))
        .catch(err => res.status(500).json({ error: err.message }));
}

async function getItemByID(req, res) {
  const itemID = req.params.itemID;

  try {
    const item = await ItemModel.findById(itemID).lean();
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const lockbox = await LockboxModel.findOne({ storedItem: itemID }).lean();

    return res.json({
      itemName: item.name,
      itemDescription: item.description,
      itemPrice: item.price,
      boxID: lockbox ? lockbox.boxID : null
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function buyItem(req, res) {
  const itemID = req.body.itemID;
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: `No token provided` });
  }
  const token = authHeader.split(' ')[1];
  let userID;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userID = decoded.username;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  try {
    const item = await ItemModel.findById(itemID);
    if (!item || !item.isSelling) {
      return res.status(404).json({ error: 'Item not available for purchase' });
    }

    const lockbox = await LockboxModel.findOne({ storedItem: itemID });
    if (!lockbox) {
      return res.status(404).json({ error: 'Lockbox not found for this item' });
    }

    const transaction = await TransactionModel.findOne({ itemID: itemID, buyerID: { $exists: false } });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found for this item' });
    }

    const buyer = await UserModel.findOne({ username: userID });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    transaction.buyerID = buyer._id;
    transaction.finishedSellingTime = new Date();
    await transaction.save();

    item.isSelling = false;
    await item.save();

    lockbox.storedItem = null;
    await lockbox.save();

    buyer.numberOfTransactions = (buyer.numberOfTransactions || 0) + 1;
    await buyer.save();

    const seller = await UserModel.findById(transaction.sellerID);
    if (seller) {
      seller.numberOfTransactions = (seller.numberOfTransactions || 0) + 1;
      await seller.save();
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  res.status(200).json({ user: userID, item : itemID});
}

async function sellItem(req, res) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: `No token provided` });
  }
  const token = authHeader.split(' ')[1];
  let userID;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userID = decoded.username;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  let { name, description, price, boxID } = req.body;
  if (typeof price === 'string') {
    price = parseFloat(price.replace(',', '.'));
  }
  if (!name || !description || !price || !boxID) {
    return res.status(400).json({ error: `Missing required fields: name: ${!name}, description: ${!description}, price: ${!price}, boxID: ${!boxID}` });
  }

  
  try {
    const newItem = new ItemModel({
      name,
      description,
      price,
      isSelling: true,
      imageLink: 'images/default.jpg'
    });
    const savedItem = await newItem.save();

    const lockbox = await LockboxModel.findOne({ boxID });
    if (!lockbox) {
      await ItemModel.findByIdAndDelete(savedItem._id);
      return res.status(404).json({ error: 'Lockbox not found' });
    }
    if (lockbox.storedItem) {
      await ItemModel.findByIdAndDelete(savedItem._id);
      return res.status(404).json({ error: 'Lockbox already contains an item' });
    }
    lockbox.storedItem = savedItem._id;
    await lockbox.save();
    if (!lockbox) {
      await ItemModel.findByIdAndDelete(savedItem._id);
      return res.status(404).json({ error: 'Lockbox not found' });
    }

    // Create transaction
    const seller = await UserModel.findOne({ username: userID });
    if (!seller) {
      await ItemModel.findByIdAndDelete(savedItem._id);
      return res.status(404).json({ error: 'Seller not found' });
    }

    const newTransaction = new TransactionModel({
      lockboxID: lockbox._id,
      sellerID: seller._id,
      itemID: savedItem._id,
      startedSellingTime: new Date()
    });
    await newTransaction.save();

    req.itemID = savedItem._id;
    itemID = savedItem._id;
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  res.status(200).json({});
}

module.exports = {
  default: defaultHandler,
  getSellingItems: getSellingItems,
  getItemByID: getItemByID,
  buyItem: buyItem,
  sellItem: sellItem
};

/*
var itemSchema = new Schema({
    'name' : String,
    'description' : String,
    'price' : Number,
    'weight' : Number,
    'isSelling' : {
        type: Boolean,
        default: true
    },
    'imageLink': {
        type: String,
        default: 'images/default.jpg'
    }
});

var lockboxSchema = new Schema({
    'boxID' : String,
    'lastOpenedPerson' : String,
    'lastOpenedTime' : Date,
    'storedItem' : {
        type: Schema.Types.ObjectId,
        ref: 'item'
    }
});

var permissionSchema = new Schema({
    'lockboxID' : String,
    'userID' : String,
    'permissionType' : String
});

var transactionSchema = new Schema({
    'lockboxID' : {
        type: Schema.Types.ObjectId,
        ref: 'lockbox'
    },
    'sellerID' : {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'buyerID' : {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'itemID' : {
        type: Schema.Types.ObjectId,
        ref: 'item'
    },
    'startedSellingTime' : Date,
    'finishedSellingTime' : Date,
});

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  numberOfTransactions: Number,
});
*/