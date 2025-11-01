const { Group } = require("../models");

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("admin", "username email").populate("members", "username email");
    res.status(200).json({ message: "", groups });
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

    const populateGroup = await Group.findById(group._id).populate("admin", "username email").populate("members", "username email");

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

    group.members.push(req.user._id);
    await group.save();

    res.status(200).json({ message: "Successfully joined the group" });
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

module.exports = { getAllGroups, createGroup, joinGroup, leaveGroup };
