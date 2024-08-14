const jwt = require("jsonwebtoken");
async function verifyUserToken(token) {
  if (!token) return;
  return await jwt.verify(token, "secret_key", (err, result) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "credentails are not correct" });
    }
    // console.log("result-->", result);
    return result;
  });
}

module.exports = verifyUserToken;
