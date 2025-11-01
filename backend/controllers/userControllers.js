const jwt = require("jsonwebtoken");
const { User } = require("../models");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "User with this email already exist" });
    }

    const user = await User.create({ username, email, password });
    if (user) {
      res.status(200).json({
        id: user._id,
        username: user.username,
        email: user.email,
        message: "User register successfully",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        },
        message: "User login successfully",
      });
    } else {
      res.status(401).json({ message: "Invalid email & password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
