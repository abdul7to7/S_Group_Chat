const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

// app.use(bodyParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  })
);

const sequelize = require("./util/db");
const User = require("./models/userModel");
const Group = require("./models/groupModel");
const GroupMembers = require("./models/groupMembersModel");
const GroupMessage = require("./models/groupMessageModel");
const Message = require("./models/messageModel");

const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const userRoutes = require("./routes/userRoutes");
const msgRoutes = require("./routes/msgRoutes");

const authVerifyToken = require("./middlewres/authVerifyToken");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/dm", authVerifyToken, msgRoutes);
app.use("/gc", authVerifyToken, groupRoutes);

// app.listen(process.env.PORT || 3000, () => {
//   console.log(`server is running on port-->${process.env.PORT || 3000}`);
// });
User.hasMany(Message);
Message.belongsTo(User);

User.belongsToMany(Group, { through: GroupMembers });
Group.belongsToMany(User, { through: GroupMembers });

Group.hasMany(GroupMessage);
GroupMessage.belongsTo(Group);

User.hasMany(GroupMessage);
GroupMessage.belongsTo(User);

sequelize
  // .sync({ force: true })
  // .sync({ alter: true })
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000);
  })
  .then(() => {
    console.log("server is running");
  });
