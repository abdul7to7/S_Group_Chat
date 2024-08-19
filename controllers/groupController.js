const GroupMessage = require("../models/groupMessageModel");
const User = require("../models/userModel");
const Group = require("../models/groupModel");

exports.getAllGroup = async (req, res, next) => {
  let groups = await Group.findAll();
  return res.json({ groups });
};

exports.getPrevGroupMessage = async (req, res) => {
  console.log(req.headers);
  let msgs = await GroupMessage.findAll({
    where: { groupId: req.headers.groupid },
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

exports.postGroupMessage = async ({ groupId, userId, content }) => {
  return await GroupMessage.create({
    groupId: groupId,
    userId: userId,
    message: content,
  });
};
