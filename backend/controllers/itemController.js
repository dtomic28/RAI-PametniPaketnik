const ItemModel = require("../models/itemModel.js");
const jwt = require("jsonwebtoken");
const { isUsernameAllowedByOrv } = require("../utils/orvValidator");
const fs = require("fs");
const path = require("path");

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


module.exports = {
  default: defaultHandler,
  getSellingItems: getSellingItems,
  createItem,
  updateItem,
  deleteItem,
};