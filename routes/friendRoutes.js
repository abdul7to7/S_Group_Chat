const {
  postSendRequest,
  postAcceptRequest,
  getAllFriends,
} = require("../controllers/friendController");

const router = require("express").Router();

router.post("/send_request", postSendRequest);
router.post("/accept_request", postAcceptRequest);
router.get("/unfriend", () => {});
router.get("/all", getAllFriends);

module.exports = router;
