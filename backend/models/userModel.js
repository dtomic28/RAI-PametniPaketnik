const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  numberOfTransactions: Number,
});

// Pre-save hook to hash password
userSchema.pre("save", function (next) {
  const user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

// Promise-based authenticate function
userSchema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username }).exec();
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch ? user : null;
};

// Get all usernames
userSchema.statics.getAllUsernames = async function () {
  const users = await this.find({}, "username").exec();
  return users.map((user) => user.username);
};

const User = mongoose.model("user", userSchema);
module.exports = User;

/*
Model za shranjevanje uporabnikov
'username'              -> uporabniško ime
'password'              -> geslo
'email'                 -> email uporabnika
'numberOfTransactions'  -> število transakcij uporabnika
*/
