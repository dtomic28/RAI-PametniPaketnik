const ItemModel = require("../models/itemModel.js");
const LockboxModel = require('../models/lockboxModel');
const jwt = require("jsonwebtoken");
const { isUsernameAllowedByOrv } = require("../utils/orvValidator");
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;
const imageProcessor = require("../utils/imageProcessor");
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

    let imageLink = null;
    if (req.file) {
      let buffer;
      if (req.file.buffer) {
        buffer = req.file.buffer;
      } else if (req.file.path) {
        buffer = await fsp.readFile(req.file.path);
      }

      if (buffer) {
        try {
          const { compressed, format } = await imageProcessor.compressBuffer(buffer);
          const uniqueName = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.bin`;
          const outPath = path.join(__dirname, "..", "images", uniqueName);
          await fsp.writeFile(outPath, compressed);
        } catch (err) {
          console.error('image compress error (create):', err);
          return res.status(500).json({ error: 'Failed to process image' });
        }
      }

      if (req.file.path) {
        fsp.unlink(req.file.path).catch(() => {});
      }
    }

    if (!imageLink && req.body && req.body.imageLink) {
      imageLink = req.body.imageLink;
    }

    const item = new ItemModel({
      name,
      description,
      price,
      weight,
      isSelling: isSelling === "true" || isSelling === true,
      imageLink: imageLink || "images/default.jpg",
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
      let buffer;
      if (req.file.buffer) {
        buffer = req.file.buffer;
      } else if (req.file.path) {
        buffer = await fsp.readFile(req.file.path);
      }

      if (buffer) {
        try {
          const { compressed, format } = await imageProcessor.compressBuffer(buffer);
          const uniqueName = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.bin`;
          const outPath = path.join(__dirname, "..", "images", uniqueName);
          await fsp.writeFile(outPath, compressed);
          const metaPath = outPath + ".json";
          await fsp.writeFile(metaPath, JSON.stringify({ format }));
          updateData.imageLink = `images/${uniqueName}`;
        } catch (err) {
          console.error('image compress error:', err);
          return res.status(500).json({ error: 'Failed to process image' });
        }
      }

      if (req.file.path) {
        fsp.unlink(req.file.path).catch(() => {});
      }
    }
      if (!updateData.imageLink && req.body && req.body.imageLink) {
        updateData.imageLink = req.body.imageLink;
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

async function sellItem2(req, res) {
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

async function sellItem(req, res) {
  // -------------------------------------------------- AUTH
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];

  let userID;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userID = decoded.username;
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // -------------------------------------------------- VARIABLES
  let { name, description, price, boxID, imageLink } = req.body;

  // NOTE: changed from `image` to `imageLink`
  if (!name || !description || !price || !boxID || !imageLink) {
    return res.status(400).json({
      error: `Missing required fields: name: ${!name}, description: ${!description}, price: ${!price}, boxID: ${!boxID}, imageLink: ${!imageLink}`,
    });
  }

  // -------------------------------------------------- PRICE
  if (typeof price === "string") {
    price = parseFloat(price.replace(",", "."));
  }
  if (Number.isNaN(price)) {
    return res.status(400).json({ error: "Invalid price" });
  }

  // -------------------------------------------------- ITEM + LOCKBOX + TRANSACTION (same behavior as before)
  let savedItem = null;
  try {
    const seller = await UserModel.findOne({ username: userID });
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    const lockbox = await LockboxModel.findOne({ boxID });
    if (!lockbox) {
      return res.status(404).json({ error: "Lockbox not found" });
    }
    if (lockbox.storedItem) {
      return res.status(409).json({ error: "Lockbox already contains an item" });
    }

    // Create item pointing at the uploaded .bin path (or legacy jpg path)
    const newItem = new ItemModel({
      name,
      description,
      price,
      isSelling: true,
      imageLink: imageLink, // <-- key change
    });
    savedItem = await newItem.save();

    // Lock the box immediately
    lockbox.storedItem = savedItem._id;
    lockbox.lastOpenedTime = new Date();
    lockbox.lastOpenedPerson = seller._id;
    await lockbox.save();

    // Create transaction
    const newTransaction = new TransactionModel({
      lockboxID: lockbox._id,
      sellerID: seller._id,
      itemID: savedItem._id,
      startedSellingTime: new Date(),
    });
    await newTransaction.save();

    return res.status(200).json({ itemID: savedItem._id });
  } catch (err) {
    // If item was created but later steps failed, clean it up
    if (savedItem?._id) {
      await ItemModel.findByIdAndDelete(savedItem._id).catch(() => {});
    }

    // Optional: also delete uploaded image to avoid orphan files
    // Only do this if you are sure imageLink always points into your local /images folder.
    try {
      if (imageLink && imageLink.startsWith("images/")) {
        fs.unlink(path.join(__dirname, "..", imageLink), () => {});
      }
    } catch (_) {}

    return res.status(500).json({ error: err.message });
  }
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
