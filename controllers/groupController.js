const GroupMessage = require("../models/groupMessageModel");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const GroupMembers = require("../models/groupMembersModel");
const upload = require("../middlewres/filesOperation");
const File = require("../models/fileModel");

exports.getAllGroup = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Group,
        attributes: ["id", "groupName"],
        through: { attributes: ["isAdmin"] },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.groups) {
      return res.json({ success: false, message: "something went wrong" });
    }
    const groups = user.groups; // Sequelize includes associated groups in the Groups property
    return res.json({ success: true, groups });
  } catch (error) {
    console.error("Error retrieving groups by user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getPrevGroupMessage = async (req, res) => {
  try {
    let msgs = await GroupMessage.findAll({
      where: { groupId: req.params.groupId },
      include: [
        {
          model: User,
          attributes: ["id", "username"], // Specify attributes to include from User model
        },
        {
          model: File,
          as: "associatedGroupMessage",
          attributes: ["key", "fileName", "fileUrl"],
          required: false,
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    for (const msg of msgs) {
      if (msg.associatedGroupMessage) {
        try {
          const fileUrl = await upload.generatePresignedUrl(
            msg.associatedGroupMessage.key
          );
          msg.associatedGroupMessage.dataValues = {
            name: msg.associatedGroupMessage.fileName,
            url: fileUrl,
          };
        } catch (error) {
          console.error(
            `Error generating URL for file ${msg.associatedGroupMessage.fileName}:`,
            error
          );
        }
      }
    }

    return res.json({ msgs: msgs.reverse() });
  } catch (e) {
    return res.status(500).json({ error: `${e} Internal Server Error` });
  }
};

exports.postGroupMessage = async ({ groupId, userId, content }) => {
  try {
    return await GroupMessage.create({
      groupId: groupId,
      userId: userId,
      message: content,
    });
  } catch (e) {
    return { sucess: false, error: e };
    return res.status(500).json({ error: `${e} Internal Server Error` });
  }
};

exports.postCreateGroup = async (req, res, next) => {
  try {
    const group = await Group.create({
      groupName: req.body.groupName,
    });
    const groupId = group.id;

    const groupAdmin = await GroupMembers.create({
      groupId: groupId,
      userId: req.user.id,
      isAdmin: true,
    });
    return res.json({ success: true });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `${e} Internal Server Error` });
  }
};

exports.getDeleteGroup = async (req, res, next) => {
  try {
    const group = await Group.destroy({
      where: {
        id: req.params.groupId,
      },
    });
    return res.json({ success: true });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `${e} Internal Server Error` });
  }
};

exports.postAddUserToGroup = async (req, res, next) => {
  try {
    const added = await GroupMembers.create({
      isAdmin: false,
      groupId: req.body.groupId,
      userId: req.body.userId,
    });
    return res.json({ success: true });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `${e} Internal Server Error` });
  }
};

exports.getAllMembersOfAGroup = async (req, res, next) => {
  try {
    const users = await Group.findOne({
      where: {
        id: req.params.groupId,
      },
      include: {
        model: User,
        attributes: ["id", "username"],
        through: {
          attributes: ["isAdmin"],
        },
      },
    });
    console.log(users);
    return res.json({ success: true, users: users.users });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `${e} Internal Server Error` });
  }
};

exports.removeMemberFromGroup = async (req, res, next) => {
  try {
    await GroupMembers.destroy({
      where: {
        userId: req.params.userId,
        groupId: req.params.groupId,
      },
    });
    return res.json({ success: true });
  } catch (e) {
    return res
      .status(500)
      .json({ success: true, message: `${e} Internal Server Error` });
  }
};

exports.leaveGroup = async (req, res, next) => {
  try {
    await GroupMembers.destroy({
      where: {
        userId: req.user.id,
        groupId: req.params.groupId,
      },
    });
    return res.json({ success: true });
  } catch (e) {
    return res
      .status(500)
      .json({ success: true, message: `${e} Internal Server Error` });
  }
};
