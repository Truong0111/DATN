const crypto = require("crypto");
const constantValue = require("./constants.json");
const {v4: uuidv4} = require('uuid');
require("dotenv").config();

module.exports = {
    hashPassword: async (password) => {
        return crypto.createHash("sha256").update(password).digest("base64");
    },

    isArrayEmptyOrNull: (array) => {
        return !array || array.length === 0;
    },

    getTimeInterval: () => {
        const timeData = constantValue.timeData;
        const msPerSecond = 1000;
        const msPerMinute = msPerSecond * 60;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const msPerMonth = msPerDay * 30;

        return timeData.seconds * msPerSecond +
            timeData.minutes * msPerMinute +
            timeData.hours * msPerHour +
            timeData.days * msPerDay +
            timeData.months * msPerMonth;
    },
    generateToken: () => {
        return uuidv4();
    }
}