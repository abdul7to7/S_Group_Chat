const {
  getGroupMsgGlobal,
  postGroupMsgGlobal,
} = require("../controllers/groupController");

const router = require("express").Router();

router.get("/global", getGroupMsgGlobal);
router.post("/global", postGroupMsgGlobal);

module.exports = router;
