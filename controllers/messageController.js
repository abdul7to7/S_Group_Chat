const Message = require("../models/messageModel");
const User = require("../models/userModel");

exports.getChat = async (req, res, next) => {
  const userId1 = req.user.id;
  const userId2 = req.headers.receiverid;
  const roomId = [userId1, userId2].sort().join("_");
  const msgs = await Message.findAll({
    where: {
      roomId: roomId,
    },
    include: {
      model: User,
      attributes: ["username"],
    },
  });
  return res.json({ msgs: msgs });
  //   console.log(typeof recvId);
  //   console.log(typeof req.user.id);
};

exports.postChat = async ({ roomId, userId, receiverid, content }) => {
  try {
    return await Message.create({
      message: content,
      userId,
      receiverId: receiverid,
      roomId,
    });
  } catch (e) {
    console.log(e);
  }
};
