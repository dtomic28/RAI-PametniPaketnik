const ItemModel = require("../models/itemModel.js");
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

module.exports = {
  default: defaultHandler,
  getSellingItems: getSellingItems
};