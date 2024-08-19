const server = `http://localhost:3000`;
const socket = io(server);

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const groupId = localStorage.getItem("groupId");
  socket.emit("joinGroupChat", { token, groupId });
  const data = await getGroupChat(groupId);
  console.log(data);
  addPrevChatToUI(data.msgs);
});

socket.on("newGroupMessage", ({ message, sender }) => {
  appendChatToUI(message, sender);
});

document
  .getElementById("send_message_btn")
  .addEventListener("click", async () => {
    const msg = document.getElementById("message").value;
    const groupId = localStorage.getItem("groupId");
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    socket.emit("sendGroupMessage", { groupId, token, content: msg });
    appendChatToUI(msg, username);
  });

function appendChatToUI(message, sender) {
  gc_list = document.getElementById("msg_list");
  const textNode = document.createTextNode(message + "-->" + sender);
  const li = document.createElement("li");
  li.appendChild(textNode);
  gc_list.appendChild(li);
}

function addPrevChatToUI(messages) {
  const msg_list = document.getElementById("msg_list");
  messages.map((msg) => {
    const li = document.createElement("li");
    const textNode = document.createTextNode(
      msg.message + "--->" + msg.user.username
    );
    li.appendChild(textNode);
    msg_list.appendChild(li);
  });
}

async function getGroupChat() {
  try {
    let data = await fetch(`${server}/gc/chat`, {
      headers: {
        token: localStorage.getItem("token"),
        groupId: localStorage.getItem("groupId"),
      },
    });
    data = await data.json();
    return data;
  } catch (e) {
    console.log(e);
  }
}
