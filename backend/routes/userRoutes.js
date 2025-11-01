const express = require("express");
const { registerUser, loginUser } = require("../controllers/userControllers");

const userRouter = express.Router();

// register user
userRouter.post("/register", registerUser);

// login user
userRouter.post("/login", loginUser);

module.exports = userRouter;
