const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const GroupMembers = sequelize.define("group_member", {
  id: {
    type: Sequelize.STRING,
    nullAllowed: false,
    primaryKey: true,
  },
});

module.exports = GroupMembers;
