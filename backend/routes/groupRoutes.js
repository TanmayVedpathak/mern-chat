const express = require("express");
const { isLogin, isAdmin } = require("../middlewares/auth");
const { getAllGroups, getGroupById, createGroup, joinGroup, acceptGroupRequest, rejectGroupRequest, leaveGroup, deleteGroup } = require("../controllers/groupControllers");

const groupRouter = express.Router();

// get all groups
groupRouter.get("/", isLogin, getAllGroups);

// get group bu id
groupRouter.get("/:groupId", isLogin, getGroupById);

// create group
groupRouter.post("/", isLogin, isAdmin, createGroup);

// join group
groupRouter.post("/:groupId/join", isLogin, joinGroup);

// accept group request
groupRouter.post("/:groupId/accept", isLogin, acceptGroupRequest);

// reject group request
groupRouter.post("/:groupId/reject", isLogin, rejectGroupRequest);

//leave a group
groupRouter.post("/:groupId/leave", isLogin, leaveGroup);

// delete a group
groupRouter.post("/:groupId/delete", isLogin, deleteGroup);

module.exports = groupRouter;
