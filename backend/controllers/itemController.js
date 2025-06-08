const ItemModel = require("../models/itemModel.js");
const LockboxModel = require('../models/lockboxModel');
const jwt = require("jsonwebtoken");
const { isUsernameAllowedByOrv } = require("../utils/orvValidator");
const fs = require("fs");
const path = require("path");
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

async function createItem(req, res) {
  try {
    const { name, description, price, weight, isSelling } = req.body;
    const item = new ItemModel({
      name,
      description,
      price,
      weight,
      isSelling: isSelling === "true" || isSelling === true,
      imageLink: req.file ? req.file.path.replace(/\\/g, "/") : "images/default.jpg",
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateItem(req, res) {
  try {
    const { name, description, price, weight, isSelling } = req.body;
    const updateData = {
      name,
      description,
      price,
      weight,
      isSelling: isSelling === "true" || isSelling === true,
    };
    if (req.file) {
      updateData.imageLink = req.file.path.replace(/\\/g, "/");
    }
    const item = await ItemModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteItem(req, res) {
  try {
    const item = await ItemModel.findByIdAndDelete(req.params.id);
    if (item && item.imageLink && item.imageLink !== "images/default.jpg") {
      fs.unlink(path.join(__dirname, "..", item.imageLink), () => {});
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
      boxID: lockbox ? lockbox.boxID : null,
      pathToImage: item.imageLink,
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

    const transaction = await TransactionModel.findOne({
      itemID: itemID,
      $or: [
        { buyerID: { $exists: false } },
        { buyerID: null }
      ]
    });
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
    lockbox.lastOpenedTime = new Date();
    lockbox.lastOpenedPerson = buyer._id;
    await lockbox.save();

    buyer.numberOfTransactions = (buyer.numberOfTransactions || 0) + 1;
    await UserModel.updateOne(
      { _id: buyer._id },
      { $inc: { numberOfTransactions: 1 } }
    );

    const seller = await UserModel.findById(transaction.sellerID);
    if (seller) {
      seller.numberOfTransactions = (seller.numberOfTransactions || 0) + 1;
        await UserModel.updateOne(
          { _id: seller._id },
          { $inc: { numberOfTransactions: 1 } }
        );
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  res.status(200).json({ user: userID, item : itemID});
}

async function sellItem(req, res) {
  // -------------------------------------------------- AUTH
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

  // -------------------------------------------------- VARIABLES
  let { name, description, price, boxID, image } = req.body;
  if (!name || !description || !price || !boxID || !image) {
    return res.status(400).json({ error: `Missing required fields: name: ${!name}, description: ${!description}, price: ${!price}, boxID: ${!boxID}, image: ${!image}` });
  }  

  // -------------------------------------------------- PRICE
  if (typeof price === 'string') {
    price = parseFloat(price.replace(',', '.'));
  }
  
  // -------------------------------------------------- IMAGE
  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }
  const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');

  const uniqueName = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
  const imagePath = path.join(__dirname, '..', 'images', uniqueName);
  fs.writeFile(imagePath, base64Data, 'base64', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save image' });
    }
  });

  // -------------------------------------------------- ITEM
  try {
    const newItem = new ItemModel({
      name,
      description,
      price,
      isSelling: true,
      imageLink: `images/${uniqueName}`
    });
    const savedItem = await newItem.save();

    const seller = await UserModel.findOne({ username: userID });
    if (!seller) {
      await ItemModel.findByIdAndDelete(savedItem._id);
      return res.status(404).json({ error: 'Seller not found' });
    }

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
    lockbox.lastOpenedTime = new Date();
    lockbox.lastOpenedPerson = seller._id;
    await lockbox.save();
    if (!lockbox) {
      await ItemModel.findByIdAndDelete(savedItem._id);
      return res.status(404).json({ error: 'Lockbox not found' });
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

  res.status(200).json({ });
}

async function storeImage(req, res) {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');

  const uniqueName = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
  const imagePath = path.join(__dirname, '..', 'images', uniqueName);
  fs.writeFile(imagePath, base64Data, 'base64', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save image' });
    }
    res.status(200).json({ filePath: `images/${uniqueName}` });
  });
}


module.exports = {
  default: defaultHandler,
  getSellingItems: getSellingItems,
  createItem,
  updateItem,
  deleteItem,
  getItemByID: getItemByID,
  buyItem: buyItem,
  sellItem: sellItem,
  storeImage: storeImage
};
