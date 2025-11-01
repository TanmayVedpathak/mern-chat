const { Message } = require("../models");

const sendMessage = async (req, res) => {
  try {
    const { content, groupId } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      content,
      group: groupId,
    });

    const populatedMessage = await Message.findById(message._id).populate("sender", "username email").populate("group", "name");

    res.status(200).json({ message: "", populatedMessage });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getGroupMessage = async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId }).populate("sender", "username email").sort({ createdAt: 1 });

    if (messages.length == 0) {
      return res.status(200).json({ message: "No message found in this group" });
    }

    res.status(200).json({ message: "", messages });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMessage, getGroupMessage };
