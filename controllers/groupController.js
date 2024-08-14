const GroupMessage = require("../models/groupMessageModel");
const User = require("../models/userModel");

exports.getPrevGroupMessage = async (req, res) => {
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

exports.postGroupMessage = async ({ groupId, userId, content }) => {
  return await GroupMessage.create({
    groupId: groupId,
    userId: userId,
    message: content,
  });
};
