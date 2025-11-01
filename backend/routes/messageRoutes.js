const express = require("express");
const { isLogin } = require("../middlewares/auth");
const { sendMessage, getGroupMessage } = require("../controllers/messageControllers");

const messageRouter = express.Router();

// send message
messageRouter.post("/", isLogin, sendMessage);

// get message for the group
messageRouter.get("/:groupId", isLogin, getGroupMessage);

module.exports = messageRouter;
