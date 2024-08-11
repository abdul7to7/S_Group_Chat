const User = require("../models/userModel");

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
