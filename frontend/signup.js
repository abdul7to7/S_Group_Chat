const server = `http://localhost:3000`;
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value;
  const mail = document.getElementById("signupMail").value;
  const phoneno = document.getElementById("signupPhoneno").value;
  const password = document.getElementById("signupPassword").value;
  await fetch(`${server}/user/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      mail: mail,
      phone: phoneno,
      password: password,
    }),
  });
});
