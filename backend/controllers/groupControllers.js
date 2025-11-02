const { Group } = require("../models");

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate([
      { path: "admin", select: "username email" },
      { path: "members", select: "username email" },
      { path: "newMembers", select: "username email" },
    ]);
    res.status(200).json({ message: "", groups });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.find({ _id: req.params.groupId }).populate([
      { path: "admin", select: "username email" },
      { path: "members", select: "username email" },
      { path: "newMembers", select: "username email" },
    ]);
    if (!group) {
      res.status(400).json({ message: "Group not found" });
    }
    res.status(200).json({ message: "", group });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    const populateGroup = await Group.findById(group._id).populate([
      { path: "admin", select: "username email" },
      { path: "members", select: "username email" },
      { path: "newMembers", select: "username email" },
    ]);

    res.status(201).json({ message: "", populateGroup });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already member of the group" });
    }

    if (group.newMembers.includes(req.user._id)) {
      return res.status(400).json({ message: "Request already" });
    }

    if (group.admin._id.toString() === req.user._id.toString()) {
      group.members.push(req.user._id);
      await group.save();

      return res.status(200).json({ message: "Group joined successfully" });
    }

    group.newMembers.push(req.user._id);
    await group.save();

    res.status(200).json({ message: "Request send to admin" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const acceptGroupRequest = async (req, res) => {
  try {
    const requestedUserId = req.body.userId;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin?._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Authorized Access" });
    }

    if (group.members.includes(requestedUserId)) {
      return res.status(400).json({ message: "Already member of the group" });
    }

    if (!group.newMembers.includes(requestedUserId)) {
      return res.status(400).json({ message: "Request not found" });
    }

    group.members.push(requestedUserId);
    group.newMembers = group.newMembers.filter((memberId) => {
      return memberId.toString() !== requestedUserId.toString();
    });

    await group.save();

    await group.populate([
      { path: "admin", select: "username email" },
      { path: "members", select: "username email" },
    ]);

    res.status(200).json({ message: "Request accept successfully", group: group });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const rejectGroupRequest = async (req, res) => {
  try {
    const requestedUserId = req.body.userId;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin?._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Authorized Access" });
    }

    if (!group.newMembers.includes(requestedUserId)) {
      return res.status(400).json({ message: "Request not found" });
    }

    group.newMembers = group.newMembers.filter((memberId) => {
      return memberId.toString() !== requestedUserId.toString();
    });

    await group.save();

    await group.populate([
      { path: "admin", select: "username email" },
      { path: "members", select: "username email" },
    ]);

    res.status(200).json({ message: "Request reject successfully", group: group });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Not a member of this group" });
    }

    group.members = group.members.filter((memberId) => {
      return memberId.toString() !== req.user._id.toString();
    });

    await group.save();

    res.json({ message: "Successfully left the group" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin?._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Authorized Access" });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Not a member of this group" });
    }

    await Group.deleteOne({ _id: group._id });

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAllGroups, getGroupById, createGroup, joinGroup, acceptGroupRequest, rejectGroupRequest, leaveGroup, deleteGroup };
