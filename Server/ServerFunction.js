const constantValue = require("./constants.json");
const ticketController = require("./API/Controllers/TicketController");
const tokenController = require("./API/Controllers/TokenController");
const util = require("../utils");
const {MqttClient} = require("mqtt");

const serverService = {
    scanToken: async () => {
        try {
            console.log(`Scan ticket at ${new Date().toISOString()}`);
            const tickets = await ticketController.getAllTicketsFromServer();

            if (util.isArrayEmptyOrNull(tickets)) {
                console.log("No ticket from server");
                return;
            }

            for (const ticket of tickets) {
                if (ticket.isAccept === false) {
                    const idToken = `${ticket.idDoor}_${ticket.idAccount}`;

                    const tokenExist = await tokenController.getTokenByIdFromServer(idToken);
                    if (tokenExist) {
                        const deleteSuccess = await tokenController.deleteTokenFromServer(idToken);
                        if (deleteSuccess) {
                            console.log(`Delete token with id ${idToken} successfully because ticket is not accepted`);
                        } else {
                            console.log(`Delete token with id ${idToken} failed on ticket check`);
                        }
                    }
                    continue;
                }
                const keyToken = `${ticket.idDoor}_${ticket.idAccount}`;
                const valueToken = await tokenController.getTokenByIdFromServer(keyToken);
                if (valueToken) {
                    const [doorPosition, MSSV, oldEndTime] = valueToken.value.split("_");
                    if (new Date(ticket.endTime) > new Date(oldEndTime)) {
                        const tokenDataUpdate = {
                            idDoor: ticket.idDoor,
                            idAccount: ticket.idAccount,
                            expiredTime: ticket.endTime,
                        }
                        const updateToken = await tokenController.updateTokenFromServer(keyToken, tokenDataUpdate);
                        if (updateToken) {
                            console.log(`Update token with id ${keyToken} with expiredTime: ${ticket.endTime} successfully`);
                        } else {
                            console.log(`Update token with expiredTime: ${ticket.endTime} failed`);
                        }
                    }
                } else {
                    if (ticket.endTime >= new Date().toISOString()) {
                        const tokenData = {
                            idDoor: ticket.idDoor,
                            idAccount: ticket.idAccount,
                            expiredTime: ticket.endTime,
                        };
                        const createSuccess = await tokenController.createTokenFromServer(tokenData);
                        if (createSuccess) {
                            console.log(`Create token for ticket id: ${ticket.idTicket} successfully`);
                        } else {
                            console.log(`Create token for ticket id: ${ticket.idTicket} failed`);
                        }
                    } else {
                        console.log(`Ticket with id ${ticket.idTicket} has expired`);
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
            const tokens = await tokenController.getAllTokensFromServer();
            if (tokens) {
                if (Object.entries(tokens).length > 0) {
                    Object.entries(tokens).map(async ([idToken, {value}]) => {
                        const ticketCheck = await tokenController.getTicketWithIdTokenFromServer(idToken);
                        if (!ticketCheck) {
                            const deleteSuccess = await tokenController.deleteTokenFromServer(idToken);
                            if (deleteSuccess) {
                                console.log(`Delete token with id ${idToken} successfully because ticket is not exist`);
                            } else {
                                console.log(`Delete token with id ${idToken} failed on ticket check`);
                            }
                        } else {
                            if(ticketCheck.isAccept === false) {
                                const [doorPosition, MSSV, endTime] = value.split('_')
                                if (new Date(endTime) < new Date().toISOString()) {
                                    const deleteSuccess = await tokenController.deleteTokenFromServer(idToken);
                                    if (deleteSuccess) {
                                        console.log(`Delete token with id ${idToken} successfully`);
                                    } else {
                                        console.log(`Delete token with id ${idToken} failed`);
                                    }
                                }
                            }
                        }
                    });
                }
            } else {
                console.log(`No token found from server`)
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
