const accountService = require("../Service/AccountService");
const doorService = require("../Service/DoorService");
const ticketService = require("../Service/TicketService");
const tokenService = require("../Service/TokenService");

const constantValue = require("../constants.json");
const util = require("../utils");
const {mqttFunction} = require("./MqttService");

const serverFunction = {
    scanTicket: async () => {
        const tickets = await ticketService.getAllTickets();

        if (util.isArrayEmptyOrNull(tickets)) {
            return;
        }

        for (const ticket of tickets) {
            if (ticket.endTime < new Date().toISOString()) {
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
            if (door.status === constantValue.doorStatus.open) {
                const tokenValue = await tokenService.getToken(door.idDoor);
                if (!tokenValue || tokenValue.timeStamp < Date.now()) {
                    const newToken = util.generateToken();
                    if (tokenValue) {
                        const isUpdateNewToken = await tokenService.updateToken(door.idDoor, newToken, newTimeStamp);
                        if (isUpdateNewToken) {
                            mqttFunction.updateToken(door.macAddress, door.idDoor, newToken);
                        }
                    } else {
                        const isUpdateNewToken = await tokenService.createToken(door.idDoor, newToken, newTimeStamp);
                        if (isUpdateNewToken) {
                            mqttFunction.updateToken(door.macAddress, door.idDoor, newToken);
                        }
                    }
                }
            } else {
                const tokenValue = await tokenService.getToken(door.idDoor);
                if (tokenValue) {
                    await tokenService.deleteToken(door.idDoor);
                }
            }
        }
    }
}

module.exports = {serverFunction};
