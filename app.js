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

const userRoutes = require("./routes/userRoutes");
const sequelize = require("./util/db");

app.use("/user", userRoutes);

// app.listen(process.env.PORT || 3000, () => {
//   console.log(`server is running on port-->${process.env.PORT || 3000}`);
// });

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
