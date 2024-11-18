const crypto = require("crypto");
require("dotenv").config();

module.exports = {
    hashPassword: async (password) => {
        return crypto.createHash("sha256").update(password).digest("base64");
    },
    isArrayEmptyOrNull: (array) => {
        return !array || array.length === 0;
    },
}