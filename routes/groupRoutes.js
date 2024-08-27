// const {
//   getGroupMsgGlobal,
//   postGroupMsgGlobal,
// } = require("../controllers/groupController");

const {
  getPrevGroupMessage,
  getAllGroup,
  postCreateGroup,
  getDeleteGroup,
  postAddUserToGroup,
  getAllMembersOfAGroup,
  removeMemberFromGroup,
} = require("../controllers/groupController");

const router = require("express").Router();

// router.get("/global", getGroupMsgGlobal);
// router.post("/global", postGroupMsgGlobal);

router.get("/chat/:groupId", getPrevGroupMessage);
router.get("/all", getAllGroup);
router.post("/create_group", postCreateGroup);
router.get("/delete_group/:groupId", getDeleteGroup);
router.post("/add_to_group", postAddUserToGroup);
router.get("/get_members/:groupId", getAllMembersOfAGroup);
router.get("/remove_member/:groupId/:userId", removeMemberFromGroup);

module.exports = router;
