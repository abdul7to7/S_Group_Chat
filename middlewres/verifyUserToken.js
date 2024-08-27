const jwt = require("jsonwebtoken");
async function verifyUserToken(token) {
  if (!token) return;
  return await jwt.verify(token, "secret_key", (err, result) => {
    if (err) {
      return {};
    }
    // console.log("result-->", result);
    return result;
  });
}

module.exports = verifyUserToken;
