const { Sequelize } = require("sequelize");
const Friend = require("../models/friendModel");
const User = require("../models/userModel");

const { Op } = require("sequelize");

exports.getAllUsersWithFriendStatus = async (req, res, next) => {
  try {
    const currentUserId = req.user.id; // ID of the current logged-in user

    const users = await User.findAll({
      attributes: ["id", "username"], // Select the attributes you want to retrieve
      include: [
        {
          model: Friend,
          as: "userFriends",
          attributes: ["id", "status", "userId", "friendId"],
          required: false,
        },
      ],
    });
    // return res.json({ users });
    const result = users
      .map((user) => {
        if (user.id == currentUserId) return;
        let isFriend = false;
        let status = "pending";
        user.userFriends.map((friend) => {
          if (friend.friendId == currentUserId) {
            status = friend.status;
            if (status == "accepted") {
              isFriend = true;
            }
          }
          // console.log(friend);
          console.log(friend.status);
        });
        console.log("length-------", user.userFriends.length, user.userFriends);
        for (let i = 0; i < user.userFriends.length; i++) {
          console.log("here-------->count", i, user.userFriends[i]);
          if (
            user.userFriends[i].userId == currentUserId ||
            user.userFriends[i].friendId == currentUserId
          ) {
            status = user.userFriends[i].status;
            console.log(user.userFriends[i].status, "----", status);
            if (status == "accepted") {
              isFriend = true;
            }
            break;
          }
        }
        return {
          id: user.id,
          username: user.username,
          isFriend: isFriend,
          status: status,
        };
      })
      .filter((user) => user !== undefined);
    console.log("----------getting all users with friend status", result);
    return res.json({ users: result });
  } catch (error) {
    console.error("Error retrieving users with friend status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllUser = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username"],
    });

    return res.json({ users: users });
  } catch (e) {
    console.log(e);
  }
};
