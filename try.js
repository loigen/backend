const crypto = require("crypto");
const secretKey = crypto.randomBytes(32).toString("hex");
console.log("Your AES-256 Secret Key:", secretKey);
