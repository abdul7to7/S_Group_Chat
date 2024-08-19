const server = `http://localhost:3000`;
const socket = io(server);

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const groupId = localStorage.getItem("groupId");
  socket.emit("joinGroupChat", { token, groupId });
  const data = await getGroupChat();
  addPrevChatToUI(data.msgs);
  const users = await getAllUsers();
  addAllUserToUI(users.users);
  const groups = await getAllGroups();
  addAllGroupToUI(groups);
});

socket.on("newGroupMessage", ({ message, sender }) => {
  appendChatToUI(message, sender);
});

document
  .getElementById("send_message_btn")
  .addEventListener("click", async () => {
    const msg = document.getElementById("send_message").value;
    const groupId = localStorage.getItem("groupId");
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    socket.emit("sendGroupMessage", { groupId, token, content: msg });
    appendChatToUI(msg, username);
  });

document.getElementById("all_users").addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("to_send")) {
    localStorage.setItem("receiverid", e.target.getAttribute("userid"));
  }
  window.location.href = "./chatWithUser.html";
});

document.getElementById("all_groups").addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("active_group")) {
    localStorage.setItem("groupId", e.target.getAttribute("groupid"));
  }
  window.location.href = "./groupChat.html";
});

function addPrevChatToUI(messages) {
  const gc = document.getElementById("global_messages");
  messages.map((msg) => {
    const li = document.createElement("li");
    const textNode = document.createTextNode(
      msg.message + "--->" + msg.user.username
    );
    li.appendChild(textNode);
    gc.appendChild(li);
  });
}

function appendChatToUI(message, sender) {
  gc_list = document.getElementById("global_messages");
  const textNode = document.createTextNode(message + "-->" + sender);
  const li = document.createElement("li");
  li.appendChild(textNode);
  gc_list.appendChild(li);
}

function addAllUserToUI(users) {
  const allUserList = document.getElementById("all_users");
  users.map((user) => {
    const textNode = document.createTextNode(user.username);
    const li = document.createElement("li");
    li.setAttribute("userid", user.id);
    li.classList.add("to_send");
    li.appendChild(textNode);
    allUserList.appendChild(li);
  });
}

function addAllGroupToUI(groups) {
  console.log(groups);
  const allGroupList = document.getElementById("all_groups");
  groups.groups.map((group) => {
    const textNode = document.createTextNode(group.groupName);
    const li = document.createElement("li");
    li.setAttribute("groupId", group.id);
    li.classList.add("active_group");
    li.appendChild(textNode);
    allGroupList.appendChild(li);
  });
}

async function getAllUsers() {
  let data = await fetch(`${server}/user/allusers`, {
    headers: {
      token: localStorage.getItem("token"),
    },
  });
  data = data.json();
  return data;
}

async function getAllGroups() {
  let data = await fetch(`${server}/gc/all`, {
    headers: {
      token: localStorage.getItem("token"),
    },
  });
  data = data.json();
  return data;
}

async function getGroupChat() {
  try {
    let data = await fetch(`${server}/gc/chat`, {
      headers: {
        token: localStorage.getItem("token"),
        groupId: 1,
      },
    });
    data = await data.json();
    return data;
  } catch (e) {
    console.log(e);
  }
}
async function postGroupChat(msg) {
  try {
    await fetch(`${server}/gc/global`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        message: msg,
      }),
    });
  } catch (e) {
    console.log(e);
  }
}
