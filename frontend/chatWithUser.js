const server = `http://localhost:3000`;
const socket = io(server);

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const receiverid = localStorage.getItem("receiverid");
  socket.emit("joinPrivateChat", { token, receiverid });
  const data = await getPrevChat();
  addPrevChatToUI(data);
});

socket.on("newPrivateMessage", (message) => {
  appendChatToUI(message);
});

document
  .getElementById("send_message_btn")
  .addEventListener("click", async (e) => {
    const message = document.getElementById("message").value;
    const username = localStorage.getItem("username");
    if (!username) {
      console.log("something went wrong");
      return;
    }
    let res = await postChat(message);

    appendChatToUI({
      content: message,
      sender: username,
    });
  });

async function getPrevChat() {
  let data = await fetch(`${server}/dm/chat`, {
    headers: {
      receiverid: localStorage.getItem("receiverid"),
      token: localStorage.getItem("token"),
    },
  });
  data = await data.json();
  return data;
}

async function postChat(message) {
  const token = localStorage.getItem("token");
  const receiverid = localStorage.getItem("receiverid");
  socket.emit("sendPrivateMessage", {
    content: message,
    token,
    receiverid,
  });
}

function addPrevChatToUI(data) {
  const msgList = document.getElementById("msg_list");
  data.msgs.map((msg) => {
    let textNode = document.createTextNode(
      msg.message + "--->" + msg.user.username
    );
    let li = document.createElement("li");
    li.appendChild(textNode);
    msgList.appendChild(li);
  });
}

function appendChatToUI(message) {
  const msgList = document.getElementById("msg_list");
  const textNode = document.createTextNode(
    message.content + "-->" + message.sender
  );
  const li = document.createElement("li");
  li.appendChild(textNode);
  msgList.appendChild(li);
}
