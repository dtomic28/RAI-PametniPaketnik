const ItemModel = require("../models/itemModel.js");
const LockboxModel = require('../models/lockboxModel');
const jwt = require("jsonwebtoken");
const { isUsernameAllowedByOrv } = require("../utils/orvValidator");

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
  const itemID = req.params.itemID
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
  res.status(200).json({ user: userID, item : itemID});
}


module.exports = {
  default: defaultHandler,
  getSellingItems: getSellingItems,
  getItemByID: getItemByID,
  buyItem: buyItem
};