const { getAllUser } = require("../controllers/userControllers");

const router = require("express").Router();

router.get("/allusers", getAllUser);

module.exports = router;
