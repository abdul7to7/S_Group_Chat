const server = "http://localhost:3000";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  let data = await getAuth(username, password);
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("username", data.username);
  localStorage.setItem("token", data.token);
  localStorage.setItem("receiverId", 1);
  localStorage.setItem("receiverName", "Global");
  localStorage.setItem("isReceiverGroup", true);
  window.location = "./main.html";
});

async function getAuth(username, password) {
  try {
    let res = await fetch(`${server}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });
    res = await res.json();
    return res;
  } catch (e) {
    console.log(e);
  }
}
