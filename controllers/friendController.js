const Friend = require("../models/friendModel");
const Sequelize = require("sequelize");
const User = require("../models/userModel");
const { Op } = require("sequelize");

exports.postSendRequest = async (req, res, next) => {
  try {
    console.log("requesting to be a friend");
    console.log(req.body.friendId);
    await Friend.bulkCreate([
      {
        userId: req.user.id,
        friendId: req.body.friendId,
        requestedBy: req.user.id,
      },
      {
        userId: req.body.friendId,
        friendId: req.user.id,
        requestedBy: req.user.id,
      },
    ]);
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }
};

exports.postAcceptRequest = async (req, res, next) => {
  try {
    await Friend.update(
      {
        status: "accepted",
        isFriends: true,
      },
      {
        where: {
          [Op.or]: [
            {
              userId: req.body.sentRequestId,
              friendId: req.user.id,
              requestedBy: req.body.sentRequestId,
            },
            {
              userId: req.user.id,
              friendId: req.body.sentRequestId,
              requestedBy: req.body.sentRequestId,
            },
          ],
        },
      }
    );
    res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }
};

exports.getAllFriends = async (req, res, next) => {
  try {
    const friends = await Friend.findAll({
      where: {
        isFriends: true,
        userId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "friendDetails",
          attributes: ["username", "mail"],
        },
      ],
      attributes: ["friendId"],
    });

    return res.json({ friends });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }
};

exports.getUnfriend = async (req, res, next) => {
  try {
    await Friend.delete({
      where: {
        [Sequelize.Op.or]: [
          { userId: req.user.id, friendId: req.params.friendId },
          { userId: req.params.friendId, friendId: req.user.id },
        ],
        isFriends: true,
      },
    });
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, message: `something went wrong:${e}` });
  }
};
