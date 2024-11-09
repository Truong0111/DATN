const crypto = require("crypto");
require("dotenv").config();

module.exports = {
  hashPassword: async (password) => {
    return crypto.createHash("sha256").update(password).digest("base64");
  },
};

// const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//   modulusLength: 2048,
//   publicKeyEncoding: {
//     type: 'spki',
//     format: 'pem',
//   },
//   privateKeyEncoding: {
//     type: 'pkcs8',
//     format: 'pem',
//   },
// });
