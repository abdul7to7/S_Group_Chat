const server = `http://localhost:3000`;
const socket = io(server);

let userFriends;
let userGroups;

window.addEventListener("DOMContentLoaded", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const receiverId = localStorage.getItem("receiverId");
  const receiverName = localStorage.getItem("receiverName");
  const isReceiverGroup = localStorage.getItem("isReceiverGroup");
  userFriends = await getUserFriends(token);
  userGroups = await getUserGroups(token);
  //   userGroups.splice(0, 1);
  const allUsers = await getAllUsers(token);
  const prevChat = await getPrevChat(token, receiverId, isReceiverGroup);
  console.log(allUsers);
  addUserFriendsToUI(userFriends);
  addUserGroupsToUI(userGroups);
  addAllUsersToUI(allUsers);
  addPrevChatToUI(prevChat);
  console.log(document.getElementById("chatting_with").innerText);
  if (isReceiverGroup) {
    socket.emit("joinGroupChat", { token, groupId: receiverId });
  } else {
    socket.emit("joinPrivateChat", { token, receiverId });
  }
  document.getElementById("chatting_with").innerText = receiverName;
});

socket.on("newGroupMessage", ({ message, sender }) => {
  console.log("new groupmsg received");
  addNewMessageToUI({ message, sender });
});

socket.on("newPrivateMessage", ({ message, sender }) => {
  addNewMessageToUI({ message, sender });
});

document
  .getElementById("send_message_btn")
  .addEventListener("click", async () => {
    const message = document.getElementById("input_message").value;
    const receiverId = localStorage.getItem("receiverId");
    const token = localStorage.getItem("token");
    const isReceiverGroup = localStorage.getItem("isReceiverGroup");
    const userId = localStorage.getItem("userId");
    console.log(typeof isReceiverGroup);
    if (isReceiverGroup == "true") {
      console.log("sending Group message");
      socket.emit("sendGroupMessage", {
        groupId: receiverId,
        token,
        content: message,
      });
    } else {
      console.log("sending private message");
      socket.emit("sendPrivateMessage", {
        content: message,
        token,
        receiverId,
      });
    }
    addNewMessageToUI({ message, sender: userId });
  });

document
  .getElementById("user_friends_list")
  .addEventListener("click", async (e) => {
    if (e.target.classList.contains("friends_list_item")) {
      const receiverId = e.target.getAttribute("friendid");
      const token = localStorage.getItem("token");
      localStorage.setItem("isReceiverGroup", false);
      localStorage.setItem("receiverId", receiverId);
      document.getElementById("chatting_with").innerText = e.target.innerText;
      localStorage.setItem("receiverName", e.target.innerText);
      const msgs = await getPrevChat(token, receiverId, false);
      addPrevChatToUI(msgs);
      socket.emit("joinPrivateChat", { token, receiverId });
    }
  });

document
  .getElementById("user_groups_list")
  .addEventListener("click", async (e) => {
    if (e.target.classList.contains("group_item")) {
      const receiverId = e.target.getAttribute("groupid");
      const token = localStorage.getItem("token");
      localStorage.setItem("isReceiverGroup", true);
      localStorage.setItem("receiverId", receiverId);
      document.getElementById("chatting_with").innerText = e.target.innerText;
      localStorage.setItem("receiverName", e.target.innerText);
      const msgs = await getPrevChat(token, receiverId, true);
      socket.emit("joinGroupChat", { token, groupId: receiverId });
      addPrevChatToUI(msgs);
    }
  });

document
  .getElementById("create_group_section_btn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    const createGroupSection = document.getElementById("create_group_section");
    if (createGroupSection.style.display == "none") {
      createGroupSection.style.display = "block";
    } else {
      createGroupSection.style.display = "none";
    }
  });

document
  .getElementById("create_group_btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const newGroupName = document.getElementById("new_group_name").value;
    await postCreateGroup(newGroupName);
    window.location.reload(true);
  });

document
  .getElementById("delete_group_section_btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const deleteGroupSection = document.getElementById("delete_group_section");
    if (deleteGroupSection.style.display == "none") {
      deleteGroupSection.style.display = "block";
      const select = document.getElementById("delete_group_section_select");
      while (select.childNodes > 1) select.removeLastChild();
      userGroups
        .filter((group) => {
          return group.group_member.isAdmin;
        })
        .forEach((group) => {
          const textNode = document.createTextNode(group.groupName);
          const option = document.createElement("option");
          option.value = group.id;
          option.appendChild(textNode);
          select.appendChild(option);
        });
    } else {
      deleteGroupSection.style.display = "none";
    }
  });

document
  .getElementById("delete_group_section_delete_btn")
  .addEventListener("click", async (e) => {
    const select = document.getElementById("delete_group_section_select");
    await deleteGroup(select.value);
    window.location.reload();
  });

document
  .getElementById("add_friend_to_group_section_btn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    const addFriendToGroupSection = document.getElementById(
      "add_friend_to_group_section"
    );
    if (addFriendToGroupSection.style.display == "none") {
      addFriendToGroupSection.style.display = "block";
      const select_group = document.getElementById(
        "add_friend_to_group_section_select_group"
      );
      while (select_group.childNodes > 1) select_group.removeLastChild();
      userGroups
        .filter((group) => {
          return group.group_member.isAdmin;
        })
        .forEach((group) => {
          const textNode = document.createTextNode(group.groupName);
          const option = document.createElement("option");
          option.value = group.id;
          option.appendChild(textNode);
          select_group.appendChild(option);
        });
      const select_friend = document.getElementById(
        "add_friend_to_group_section_select_friend"
      );
      while (select_friend.childNodes > 1) select_friend.removeLastChild();
      userFriends.forEach((friend) => {
        const textNode = document.createTextNode(friend.friendDetails.username);
        const option = document.createElement("option");
        option.value = friend.friendId;
        option.appendChild(textNode);
        select_friend.appendChild(option);
      });
    } else {
      addFriendToGroupSection.style.display = "none";
    }
  });

document
  .getElementById("remove_friend_to_group_section_btn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    const removeFriendToGroupSection = document.getElementById(
      "remove_friend_to_group_section"
    );
    if (removeFriendToGroupSection.style.display == "none") {
      removeFriendToGroupSection.style.display = "block";
      const select_group = document.getElementById(
        "remove_friend_to_group_section_select_group"
      );
      while (select_group.childNodes > 1) select_group.removeLastChild();

      userGroups
        .filter((group) => {
          return group.group_member.isAdmin;
        })
        .forEach((group) => {
          const textNode = document.createTextNode(group.groupName);
          const option = document.createElement("option");
          option.value = group.id;
          option.appendChild(textNode);
          select_group.appendChild(option);
        });
      select_group.addEventListener("change", async () => {
        console.log(select_group.value);
        const select_friend = document.getElementById(
          "remove_friend_to_group_section_select_friend"
        );
        while (select_friend.childNodes > 1) select_friend.removeLastChild();
        const thisGroupUsers = await getGroupMembers(select_group.value);
        console.log(thisGroupUsers);
        if (thisGroupUsers.users.length == 0) return;
        thisGroupUsers.users.forEach((user) => {
          const textNode = document.createTextNode(user.username);
          const option = document.createElement("option");
          option.value = user.id;
          option.appendChild(textNode);
          select_friend.appendChild(option);
        });
      });
    } else {
      removeFriendToGroupSection.style.display = "none";
    }
  });

document
  .getElementById("add_friend_to_group_section_add_btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const select_group = document.getElementById(
      "add_friend_to_group_section_select_group"
    );
    const select_friend = document.getElementById(
      "add_friend_to_group_section_select_friend"
    );
    // await deleteGroup(select_group.value);
    await addFriendToGroup(select_group.value, select_friend.value);
    console.log("after query fxn");
    window.location.reload(true);
  });

document
  .getElementById("remove_friend_to_group_section_remove_btn")
  .addEventListener("click", async (e) => {
    const select_group = document.getElementById(
      "remove_friend_to_group_section_select_group"
    );
    const select_friend = document.getElementById(
      "remove_friend_to_group_section_select_friend"
    );
    // await deleteGroup(select_group.value);
    await removeUserToGroup(select_group.value, select_friend.value);
    window.location.reload(true);
  });

// document
//   .getElementById("delete_friend_section_btn")
//   .addEventListener("click", (e) => {
//     e.preventDefault();
//     const deleteFriendSection = document.getElementById(
//       "delete_friend_section"
//     );
//     if (deleteFriendSection.style.display == "none") {
//       deleteFriendSection.style.display = "block";
//       const select = document.getElementById("delete_friend_section_select");
//       userFriends.forEach((friend) => {
//         const textNode = document.createTextNode(friend.friendDetails.username);
//         const option = document.createElement("option");
//         option.value = friend.friendDetails.id;
//         option.appendChild(textNode);
//         select.appendChild(option);
//       });
//     } else {
//       deleteFriendSection.style.display = "none";
//     }
//   });

async function getUserFriends(token) {
  try {
    let res = await fetch(`${server}/friend/all`, {
      headers: {
        token: token,
      },
    });
    res = await res.json();
    return res.friends;
  } catch (e) {
    console.log(e);
  }
}

async function getUserGroups(token) {
  try {
    let res = await fetch(`${server}/gc/all`, {
      headers: {
        token: token,
      },
    });
    res = await res.json();
    return res.groups;
  } catch (e) {
    console.log(e);
  }
}

async function postCreateGroup(name) {
  try {
    const token = localStorage.getItem("token");
    await fetch(`${server}/gc/create_group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
      body: JSON.stringify({
        groupName: name,
      }),
    });
  } catch (e) {
    console.log(e);
  }
}
async function getAllUsers(token) {
  try {
    let res = await fetch(`${server}/user/allusers_excl`, {
      headers: {
        token: token,
      },
    });
    res = await res.json();
    return res;
  } catch (e) {
    console.log(e);
  }
}

async function getPrevChat(token, receiverId = 1, isGroup = "true") {
  try {
    if (isGroup == "true") {
      let res = await fetch(`${server}/gc/chat/${receiverId}`, {
        headers: {
          token: token,
        },
      });
      res = await res.json();
      return res;
    } else {
      let res = await fetch(`${server}/dm/chat/${receiverId}`, {
        headers: {
          token: token,
        },
      });
      res = await res.json();
      return res;
    }
  } catch (e) {
    console.log(e);
  }
}

function addUserFriendsToUI(friends) {
  const friends_list = document.getElementById("user_friends_list");
  friends.forEach((friend) => {
    const textNode = document.createTextNode(friend.friendDetails.username);
    const li = document.createElement("li");
    li.classList.add("friends_list_item");
    li.setAttribute("friendid", friend.friendId);
    li.appendChild(textNode);
    friends_list.appendChild(li);
  });
}

function addUserGroupsToUI(groups) {
  const groups_list = document.getElementById("user_groups_list");
  groups.forEach((group) => {
    const textNode = document.createTextNode(group.groupName);
    const li = document.createElement("li");
    li.classList.add(`group_item`);
    li.setAttribute("groupid", group.id);
    li.appendChild(textNode);
    groups_list.appendChild(li);
  });
}
function addAllUsersToUI(allUsers) {
  const all_users_list = document.getElementById("all_users_list");
  allUsers.users.forEach((user) => {
    const textNode = document.createTextNode(user.username);
    const li = document.createElement("li");
    li.classList.add("all_users_list_item");
    li.setAttribute("userid", user.id);
    li.appendChild(textNode);
    all_users_list.appendChild(li);
  });
}

function addPrevChatToUI(chat) {
  const chatList = document.getElementById("chat_list");
  while (chatList.childNodes.length > 0) {
    chatList.removeChild(chatList.firstChild);
  }
  chat.msgs.forEach((msg) => {
    const textNode = document.createTextNode(msg.message);
    const li = document.createElement("li");
    li.appendChild(textNode);
    chatList.appendChild(li);
  });
}

function addNewMessageToUI({ message, sender }) {
  console.log(message, sender);
  const chatList = document.getElementById("chat_list");
  while (chatList.childNodes.length >= 10) {
    chatList.removeChild(chatList.firstChild);
  }
  const textNode = document.createTextNode(message);
  const li = document.createElement("li");
  li.appendChild(textNode);
  chatList.appendChild(li);
}

async function deleteGroup(id) {
  try {
    return await fetch(`${server}/gc/delete_group/${id}`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
  } catch (e) {
    console.log(e);
  }
}

async function addFriendToGroup(groupId, userId) {
  try {
    return await fetch(`${server}/gc/add_to_group`, {
      method: "POST",
      headers: {
        token: localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId,
        userId,
      }),
    });
  } catch (e) {
    console.log(e);
  }
}

async function getGroupMembers(groupId) {
  try {
    let members = await fetch(`${server}/gc/get_members/${groupId}`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
    members = members.json();
    return members;
  } catch (e) {
    console.log(e);
  }
}

async function removeUserToGroup(groupId, userId) {
  try {
    let member = await fetch(
      `${server}/gc/remove_member/${groupId}/${userId}`,
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
  } catch (e) {
    console.log(e);
  }
}
