const constantValue = require("./constants.json");
const ticketService = require("./Firebase/FirebaseService").ticketService;
const tokenController = require("./API/Controllers/TokenController");
const {MqttClient} = require("mqtt");

const timeData = constantValue.timeData;
const msPerSecond = 1000;
const msPerMinute = msPerSecond * 60;
const msPerHour = msPerMinute * 60;
const msPerDay = msPerHour * 24;
const msPerMonth = msPerDay * 30;

const totalDelay =
    timeData.seconds * msPerSecond +
    timeData.minutes * msPerMinute +
    timeData.hours * msPerHour +
    timeData.days * msPerDay +
    timeData.months * msPerMonth;

const serverService = {
    scanToken: async () => {
        try {
            console.log(`Scan ticket at ${new Date().toISOString()}`);
            const tickets = await ticketService.getAllTickets();
            for (const ticket of tickets) {
                if (ticket.isAccept === true) {
                    const keyToken = `${ticket.idDoor}-${ticket.idAccount}`;
                    const valueToken = await tokenController.getToken(keyToken);
                    if (valueToken) {
                    } else {
                        if (ticket.endTime >= new Date().toISOString()) {
                            const tokenData = {
                                idDoor: ticket.idDoor,
                                idAccount: ticket.idAccount,
                                expiredTime: ticket.endTime,
                            };
                            await tokenController.createToken(tokenData);
                            console.log("Create token for ticket id: ", ticket.idTicket);
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    },

    scanTicket: async () => {
        try {
            console.log(`Scan token at ${new Date().toISOString()}`);
            const tokens = await tokenController.getAllTokens();
            if (tokens && Object.keys(tokens).length > 0) {
                Object.keys(tokens).map((key) => {
                    if (tokens[key].value < new Date().toISOString()) {
                        tokenController.deleteToken(key);
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
}

const mqttService = {
    getMessage: (message) => {
        try {
            console.log(`Get message on service: ${message}`);
        } catch (e) {
            console.error("Error: ", e);
        }
    },
    sendMessage: async (client, topic, message) => {
        try {

        } catch (e) {
            console.error("Error: ", e);
        }
    }
}

module.exports = {serverService, mqttService};
