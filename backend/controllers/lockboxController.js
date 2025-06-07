const Lockbox = require("../models/lockboxModel");

// GET /lockbox
function defaultHandler(req, res) {
  res.json({ message: "default function in lockboxController" });
}

//get /lockbox/all
async function getAllLockboxes(req, res) {
  try{
  const lockboxes = await Lockbox.find({})
      .populate("lastOpenedPerson")
      .populate("storedItem")
      .exec();
    res.json(lockboxes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
module.exports = {
  default: defaultHandler,
  getAllLockboxes
};
