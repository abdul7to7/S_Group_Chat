const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Message = sequelize.define("message", {
  receiverId: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
  message: {
    type: Sequelize.STRING,
  },
});

module.exports = Message;
