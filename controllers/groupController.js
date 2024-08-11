const GroupMessage = require("../models/groupMessageModel");
const User = require("../models/userModel");

exports.getGroupMsgGlobal = async (req, res) => {
  let msgs = await GroupMessage.findAll({
    where: { groupId: 1 },
    include: [
      {
        model: User,
        attributes: ["id", "username"], // Specify attributes to include from User model
      },
    ],
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });
  res.json({ msgs: msgs });
};

exports.postGroupMsgGlobal = async (req, res) => {
  console.log("here", req.body);
  console.log("here", req.user);
  await GroupMessage.create({
    groupId: 1,
    userId: req.user.id,
    message: req.body.message,
  });
};
