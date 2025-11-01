const express = require("express");
const { isLogin, isAdmin } = require("../middlewares/auth");
const { getAllGroups, createGroup, joinGroup, leaveGroup } = require("../controllers/groupControllers");

const groupRouter = express.Router();

// get all groups
groupRouter.get("/", isLogin, getAllGroups);

// create group
groupRouter.post("/", isLogin, isAdmin, createGroup);

// join group
groupRouter.post("/:groupId/join", isLogin, joinGroup);

//leave a group
groupRouter.post("/:groupId/leave", isLogin, leaveGroup);

module.exports = groupRouter;
