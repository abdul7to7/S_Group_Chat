const server = `http://localhost:3000`;
window.addEventListener("DOMContentLoaded", async () => {
  const data = await getGlobalChat();
  addChatToUI(data.msgs);
  const users = await getAllUser();
  addAllUserToUI(users.users);
  console.log(data, users);
});

document
  .getElementById("send_message_btn")
  .addEventListener("click", async () => {
    const msg = document.getElementById("send_message").value;

    await postGlobalChat(msg);
  });

document.getElementById("all_users").addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("to_send")) {
    localStorage.setItem("receiverId", e.target.getAttribute("userid"));
  }
  window.location.href = "./chatWithUser.html";
});

function addChatToUI(messages) {
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

async function getGlobalChat() {
  try {
    let data = await fetch(`${server}/gc/global`, {
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
async function postGlobalChat(msg) {
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
