const jwt = require("jsonwebtoken");
const { User } = require("../models");

const isLogin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      next();
      return;
    } catch (error) {
      return res.status(401).json({ message: "Not authenticated, token failure" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authenticated, token not found" });
  }
};

const isAdmin = async (req, res, next) => {
  console.log(req.user);
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Not authorized admin only" });
    }
  } catch (error) {
    res.status(401).json({ message: "Not authorized admin only" });
  }
};

module.exports = { isLogin, isAdmin };
