const constantValue = require("../constants.json");
const util = require("../utils");
const {mqttFunction} = require("./MqttService");
const logger = require("../winston");

const doorService = require("../Service/DoorService");
const ticketService = require("../Service/TicketService");
const tokenService = require("../Service/TokenService");

const serverFunction = {
    scanTicket: async () => {
        const tickets = await ticketService.getAllTickets();

        if (util.isArrayEmptyOrNull(tickets)) {
            return;
        }

        for (const ticket of tickets) {
            if (ticket.endTime < new Date().toISOString()) {
                logger.info(`Delete ticket ${ticket.idTicket} because time out by server`, {endTime: ticket.endTime});
                await ticketService.deleteTicket(ticket.idTicket);
                continue;
            }

            const accountExists = await doorService.isAccountCanAccessDoor(ticket.idDoor, ticket.idAccount);

            if (ticket.isAccept && !accountExists) {
                await doorService.addAccountCanAccess(ticket.idDoor, ticket.idAccount);
            } else if (!ticket.isAccept && accountExists) {
                await doorService.removeAccountCanAccess(ticket.idDoor, ticket.idAccount);
            }
        }
    },

    scanDoor: async () => {
        const doors = await doorService.getAllDoors();
        const currentTime = new Date();
        currentTime.setMinutes(0, 0, 0);
        currentTime.setHours(currentTime.getHours() + 1);
        const newTimeStamp = currentTime.getTime();

        for (const door of doors) {
            if (door.status) {
                const tokenValue = await tokenService.getToken(door.idDoor);
                if (!tokenValue || tokenValue.timeStamp < Date.now()) {
                    const newToken = util.generateToken();
                    if (tokenValue) {
                        logger.info(`Request update token for door ${door.idDoor} by server`);
                        const isUpdateNewToken = await tokenService.updateToken(door.idDoor, newToken, newTimeStamp);
                        if (isUpdateNewToken) {
                            logger.info(`Request send update token to MQTT Broker by server`);
                            mqttFunction.updateToken(door.macAddress, door.idDoor, newToken);
                        } else {
                            logger.info(`Failed to update token for door ${door.idDoor} by server`, {error: "Token update failed"});
                        }
                    } else {
                        logger.info(`Request create token for door ${door.idDoor} by server`);
                        const isUpdateNewToken = await tokenService.createToken(door.idDoor, newToken, newTimeStamp);
                        if (isUpdateNewToken) {
                            logger.info(`Request send update token to MQTT Broker by server`);
                            mqttFunction.updateToken(door.macAddress, door.idDoor, newToken);
                        } else {
                            logger.info(`Failed to create token for MQTT Broker by server`, {error: "Token is created failed"});
                        }
                    }
                }
            } else {
                const tokenValue = await tokenService.getToken(door.idDoor);
                if (tokenValue) {
                    logger.info(`Request delete token for door ${door.idDoor} by server`);
                    await tokenService.deleteToken(door.idDoor);
                }
                else{
                    logger.info(`No token found for door ${door.idDoor} by server`);
                }
            }
        }
    }
}

module.exports = {serverFunction};
