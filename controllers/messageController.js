const Message = require("../models/messageModel");
const { Op } = require("sequelize");
const User = require("../models/userModel");

exports.getChat = async (req, res, next) => {
  let recvId = req.headers.receiverid;
  const msgs = await Message.findAll({
    where: {
      [Op.or]: [
        { userId: req.user.id, receiverId: recvId },
        { userId: recvId, receiverId: req.user.id },
      ],
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

exports.postChat = async (req, res, next) => {
  try {
    console.log(req.body);
    console.log(req.headers);
    await Message.create({
      message: req.body.message,
      userId: req.user.id,
      receiverId: req.headers.receiverid,
    });
    return res.json({ success: true });
  } catch (e) {
    console.log(e);
  }
};
