const { getChat, postChat } = require("../controllers/messageController");

const router = require("express").Router();

router.get("/chat", getChat);
// router.post("/send", postChat);

module.exports = router;
