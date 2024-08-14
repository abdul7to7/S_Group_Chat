// const {
//   getGroupMsgGlobal,
//   postGroupMsgGlobal,
// } = require("../controllers/groupController");

const { getPrevGroupMessage } = require("../controllers/groupController");

const router = require("express").Router();

// router.get("/global", getGroupMsgGlobal);
// router.post("/global", postGroupMsgGlobal);

router.get("/chat", getPrevGroupMessage);

module.exports = router;
