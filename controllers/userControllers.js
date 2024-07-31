const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const generateToken = require("../routes/middlewres/authGenerateToken");

exports.signup = async (req, res, next) => {
  try {
    const userExisted = User.findOne({ where: { mail: req.body.mail } });
    if (userExisted) {
      return res
        .status(409)
        .json({ success: false, message: "user mail already exist" });
    }
    const hashed = await bcrypt.hash(req.body.password, 10);
    if (!hashed) {
      return res.status(500).json(err);
    }
    const user = await User.create({
      username: req.body.username,
      mail: req.body.mail,
      phoneno: req.body.phoneno,
      password: hashed,
    });
    if (user) {
      return res
        .status(201)
        .json({ success: true, message: "created successfully" });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "something went wrong" });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `something went wrong: ${e}` });
  }
};

exports.login = async (req, res, next) => {
  try {
    console.log(req.body);
    const hashed = await bcrypt.hash(req.body.password, 10);
    if (!hashed) {
      return res.status(500).json(err);
    }
    const user = await User.findOne({ where: { mail: req.body.mail } });
    if (!user) {
      return res
        .status(403)
        .send({ success: "false", message: "invalid username or password" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (isMatch) {
      const { password, ...userDetails } = user;
      const token = generateToken(userDetails);
      return res
        .status(201)
        .json({ success: true, message: "login successfully", token: token });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "something went wrong" });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: `something went wrong: ${e}` });
  }
};
