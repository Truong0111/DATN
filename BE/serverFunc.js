const constantValue = require("./constants.json");

const timeData = constantValue.timeData;

const msPerSecond = 1000;
const msPerMinute = msPerSecond * 60;
const msPerHour = msPerMinute * 60;
const msPerDay = msPerHour * 24;    
const msPerMonth = msPerDay * 30;

async function scanToken() {

    // Tính tổng thời gian chờ đợi
    const totalDelay =
        timeData.seconds * msPerSecond +
        timeData.minutes * msPerMinute +
        timeData.hours * msPerHour +
        timeData.days * msPerDay +
        timeData.months * msPerMonth;

    await new Promise((resolve) => setTimeout(resolve, totalDelay));

    console.log(`Executing scanToken after ${totalDelay / 1000} seconds`);
    // Thực thi hành động tại đây, ví dụ: gọi API hoặc các tác vụ khác.
}

async function scanTicket() {
    const totalDelay =
        timeData.seconds * msPerSecond +
        timeData.minutes * msPerMinute +
        timeData.hours * msPerHour +
        timeData.days * msPerDay +
        timeData.months * msPerMonth;

    await new Promise((resolve) => setTimeout(resolve, totalDelay));

    console.log(`Executing scanTicket after ${totalDelay / 1000} seconds`);
}

module.exports = { scanToken, scanTicket };
