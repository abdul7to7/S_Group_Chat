const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://s-group-chat.onrender.com", "http://127.0.0.1:5500"],
  },
});
// app.use(bodyParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["https://s-group-chat.onrender.com", "http://127.0.0.1:5500"],
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
const friendRoutes = require("./routes/friendRoutes");

const authVerifyToken = require("./middlewres/authVerifyToken");
const verifyUserToken = require("./middlewres/verifyUserToken");
const { postChat } = require("./controllers/messageController");
const { postGroupMessage } = require("./controllers/groupController");
const Friend = require("./models/friendModel");
const File = require("./models/fileModel");
const fileOperaions = require("./middlewres/filesOperation");
const scheduler = require("./util/scheduler");

app.use("/auth", authRoutes);
app.use("/user", authVerifyToken, userRoutes);
app.use("/dm", authVerifyToken, msgRoutes);
app.use("/gc", authVerifyToken, groupRoutes);
app.use("/friend", authVerifyToken, friendRoutes);

// app.listen(process.env.PORT || 3000, () => {
//   console.log(`server is running on port-->${process.env.PORT || 3000}`);
// });
User.hasMany(Message, {
  onDelete: "CASCADE",
});
Message.belongsTo(User);

User.belongsToMany(Group, { through: GroupMembers });
Group.belongsToMany(User, { through: GroupMembers });

Group.hasMany(GroupMessage, {
  onDelete: "CASCADE",
});
GroupMessage.belongsTo(Group);

User.hasMany(GroupMessage);
GroupMessage.belongsTo(User);

// Friend model associations
// User.belongsToMany(User, {
//   through: Friend,
//   as: "Friends", // Alias for the association
//   foreignKey: "userId",
//   otherKey: "friendId",
// });
User.hasMany(Friend, { foreignKey: "userId", as: "userFriends" });
Friend.belongsTo(User, { foreignKey: "userId", as: "userDetails" });
Friend.belongsTo(User, { foreignKey: "friendId", as: "friendDetails" });

// File.hasOne(Message);
// Message.belongsTo(File);
// File.hasOne(GroupMessage);
// GroupMessage.belongsTo(File);

Message.hasOne(File, {
  as: "associatedMessage",
  foreignKey: {
    allowNull: true,
  },
  onDelete: "CASCADE",
});
GroupMessage.hasOne(File, {
  as: "associatedGroupMessage",
  foreignKey: {
    allowNull: true,
  },
  onDelete: "CASCADE",
});

io.on("connection", (socket) => {
  console.log("A new user has connected", socket.id);

  // Join a 1-to-1 chat room
  socket.on("joinPrivateChat", async ({ token, receiverId }) => {
    const user = await verifyUserToken(token);

    if (!user) {
      console.log("something went wrong");
      return;
    }
    const userId1 = user.id;
    const userId2 = receiverId;
    const roomId = [userId1, userId2].sort().join("_"); // Ensure consistent room ID generation
    socket.join(roomId);
    console.log(`User ${socket.id} joined private chat room ${roomId}`);
  });

  // Handle sending a message in a 1-to-1 chat
  socket.on(
    "sendPrivateMessage",
    async ({ token, receiverId, content, file }) => {
      const user = await verifyUserToken(token);
      if (!user) {
        console.log("something went wrong");
        return;
      }
      const userId1 = user.id;
      const userId2 = receiverId;
      const roomId = [userId1, userId2].sort().join("_");

      console.log(roomId, content);

      try {
        const res = await postChat({
          roomId,
          userId: user.id,
          receiverId,
          content,
        });
        let fileuploaded;
        if (file.data) {
          fileuploaded = await fileOperaions.fileUpload(file, null, res.id);
        }
        socket.to(roomId).emit("newPrivateMessage", {
          message: content,
          sender: user.id,
          file: {
            name: fileuploaded?.dataValues.fileName,
            url: fileuploaded?.preSignedUrl,
          },
        });
      } catch (error) {
        console.error("Error sending private message:", error);
        socket.emit("error", { message: "Failed to send message." });
      }
    }
  );

  // Join a group chat room
  socket.on("joinGroupChat", async ({ groupId, token }) => {
    const user = await verifyUserToken(token);
    socket.join(groupId);
    console.log(`User ${socket.id} joined group chat room ${groupId}`);
  });

  // Handle sending a message in a group chat
  socket.on("sendGroupMessage", async ({ groupId, token, content, file }) => {
    try {
      const user = await verifyUserToken(token);
      if (!user) {
        console.log("something went wrong");
        return;
      }
      // Check if there's a file to upload

      let res = await postGroupMessage({
        groupId,
        userId: user.id,
        content,
      });
      let fileuploaded;
      if (file.data) {
        fileuploaded = await fileOperaions.fileUpload(file, res.id, null);
      }

      if (res.sucess == false) {
        console.log(res.error);
        return;
      }

      socket.to(groupId).emit("newGroupMessage", {
        message: content,
        sender: user.username,
        file: {
          name: fileuploaded?.dataValues.fileName,
          url: fileuploaded?.preSignedUrl,
        },
      });
    } catch (error) {
      console.error("Error sending group message:", error);
      socket
        .to(groupId)
        .emit("error", { message: "Failed to send group message." });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });
});

sequelize
  // .sync({ force: true })
  // .sync({ alter: true })
  .sync()
  .then(() => {
    server.listen(process.env.PORT || 3000);
  })
  .then(() => {
    console.log("server is running");
  });
