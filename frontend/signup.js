const server = `http://localhost:3000`;
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value;
  const mail = document.getElementById("signupMail").value;
  const phoneno = document.getElementById("signupPhoneno").value;
  const password = document.getElementById("signupPassword").value;
  let data = await fetch(`${server}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      mail: mail,
      phoneno: phoneno,
      password: password,
    }),
  });
  data = await data.json();
  localStorage.setItem("token", data.token);
  console.log(data);

  window.location = "./homePage.html";
});
