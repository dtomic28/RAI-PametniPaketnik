const UserModel = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const { isUsernameAllowedByOrv } = require("../utils/orvValidator");

// GET /user
function defaultHandler(req, res) {
  res.json({ message: "default function in userController" });
}

// GET /user/all
async function getAllUsers(req, res) {
  try {
    const users = await UserModel.find({});
    return res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
}

// POST /user/register
async function create(req, res, next) {
  const user = new UserModel({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    numberOfTransactions: 0,
  });

  try {
    const savedUser = await user.save();
    return res.json(savedUser);
  } catch (err) {
    next(err);
  }
}

// POST /user/login
async function login(req, res, next) {
  try {
    const user = await UserModel.authenticate(
      req.body.username,
      req.body.password
    );
    if (!user) {
      return res.status(401).json({ error: "Wrong username or password" });
    }

    let allowed = false;
    try {
      allowed = await isUsernameAllowedByOrv(user.username);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "Login failed due to external check" });
    }

    if (!allowed) {
      return res
        .status(403)
        .json({ error: "Username is not authorized by ORV API" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token });
  } catch (err) {
    console.log(err);
    next(err);
  }
}


async function loginAdmin(req, res, next) {
  try {
    const user = await UserModel.authenticate(
      req.body.username,
      req.body.password
    );
    if (!user) {
      return res.status(401).json({ error: "Wrong username or password" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: "User is not an admin" });
    }

    let allowed = false;
    try {
      allowed = await isUsernameAllowedByOrv(user.username);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "Login failed due to external check" });
    }

    if (!allowed) {
      return res
        .status(403)
        .json({ error: "Username is not authorized by ORV API" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token });
  } catch (err) {
    console.log(err);
    next(err);
  }
}


// POST /user/logout
function logout(req, res, next) {
  // JWT-based: nothing to destroy
  return res
    .status(200)
    .json({ message: "Logged out (client should delete token)" });
}

// GET /user/usernameExists/:username
function usernameExists(req, res, next) {
  const username = req.params.username;
  if (!username) {
    return res.status(400).json({ error: "Username not found" });
  }

  UserModel.getAllUsernames()
    .then((usernames) => {
      const exists = usernames.includes(username);
      return res.status(200).json({ exists });
    })
    .catch(() => {
      return res.status(401).json({ error: "Database error" });
    });
}

function deleteUser(req, res) {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ error: "User ID not provided" });
  }

  UserModel.findByIdAndDelete(userId)
    .then((deletedUser) => {
      if (!deletedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ message: "User deleted successfully" });
    })
    .catch((err) => {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Database error" });
    });

}

function updateUser(req, res) {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ error: "User ID not provided" });
  }

  const updateData = {
    username: req.body.username,
    email: req.body.email,
    numberOfTransactions: req.body.numberOfTransactions,
  };

  UserModel.findByIdAndUpdate(userId, updateData, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json(updatedUser);
    })
    .catch((err) => {
      console.error("Error updating user:", err);
      return res.status(500).json({ error: "Database error" });
    });
}

module.exports = {
  default: defaultHandler,
  create,
  login,
  loginAdmin,
  logout,
  usernameExists,
  getAllUsers,
  deleteUser,
  updateUser,
};
