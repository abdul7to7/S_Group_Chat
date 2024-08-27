const Message = require("../models/messageModel");
const User = require("../models/userModel");

exports.getChat = async (req, res, next) => {
  try {
    const userId1 = req.user.id;
    const userId2 = req.params.receiverId;
    const roomId = [userId1, userId2].sort().join("_");
    const msgs = await Message.findAll({
      where: {
        roomId: roomId,
      },
      include: {
        model: User,
        attributes: ["username"],
      },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    return res.json({ msgs: msgs.reverse() });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }

  //   console.log(typeof recvId);
  //   console.log(typeof req.user.id);
};

exports.postChat = async ({ roomId, userId, receiverId, content }) => {
  try {
    return await Message.create({
      message: content,
      userId,
      receiverId: receiverId,
      roomId,
    });
  } catch (e) {
    console.log(e);
  }
};
