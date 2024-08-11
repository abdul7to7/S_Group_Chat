const server = "http://localhost:3000";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const mail = document.getElementById("loginMail").value;
  const password = document.getElementById("loginPassword").value;
  let data = await fetch(`${server}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mail: mail,
      password: password,
    }),
  });
  data = await data.json();
  console.log(data);
  alert("ok");
  localStorage.setItem("token", data.token);
  window.location = "./homePage.html";
});
