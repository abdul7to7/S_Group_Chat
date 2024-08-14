const server = `http://localhost:3000`;
const socket = io(server);

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const groupId = localStorage.getItem("groupId");
  socket.emit("joinGroupChat", { token, groupId });
  const data = await getGroupChat();
  addPrevChatToUI(data.msgs);
  const users = await getAllUser();
  addAllUserToUI(users.users);
  console.log(data, users);
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

async function getAllUser() {
  let data = await fetch(`${server}/user/allusers`);
  data = data.json();
  return data;
}

async function getGroupChat() {
  try {
    let data = await fetch(`${server}/gc/chat`, {
      headers: {
        token: localStorage.getItem("token"),
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
