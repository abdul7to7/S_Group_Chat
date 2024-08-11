const server = `http://localhost:3000`;
window.addEventListener("DOMContentLoaded", async () => {
  const data = await getPrevChat();
  addChatToUI(data);
});

document
  .getElementById("send_message_btn")
  .addEventListener("click", async (e) => {
    const message = document.getElementById("message").value;
    let res = await postChat(message);
    console.log(res);
  });

async function getPrevChat() {
  let data = await fetch(`${server}/dm/chat`, {
    headers: {
      receiverid: localStorage.getItem("receiverId"),
      token: localStorage.getItem("token"),
    },
  });
  data = await data.json();
  return data;
}

async function postChat(message) {
  fetch(`${server}/dm/send`, {
    method: "POST",
    headers: {
      token: localStorage.getItem("token"),
      receiverid: localStorage.getItem("receiverId"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
    }),
  });
}

function addChatToUI(data) {
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
