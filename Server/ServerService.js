const ticketController = require("./API/Controllers/TicketController");
const tokenController = require("./API/Controllers/TokenController");
const util = require("./utils");
const {MqttClient} = require("mqtt");

const serverService = {
    scanToken: async () => {

    },

    scanTicket: async () => {

    },

    publishIp: async (ip) => {
        await tokenController.publishIPAddress(ip);
    }
}

const mqttService = {
    getMessage: (message) => {

    },
    sendMessage: async (client, topic, message) => {

    }
}

module.exports = {serverFunction: serverService, mqttFunction: mqttService};
