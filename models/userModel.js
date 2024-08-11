const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const User = sequelize.define("user", {
  username: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
  mail: {
    type: Sequelize.STRING,
    nullAllowed: false,
    unique: true,
  },
  phoneno: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
  password: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
  admin: {
    type: Sequelize.BOOLEAN,
    default: false,
  },
});
module.exports = User;
