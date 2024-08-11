const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const GroupMessage = sequelize.define("group_message", {
  message: {
    type: Sequelize.STRING,
  },
});

module.exports = GroupMessage;
