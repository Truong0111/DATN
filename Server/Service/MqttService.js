const doorService = require("../Service/DoorService");
const tokenService = require("../Service/TokenService");
const EventEmitter = require("events");
const logger = require("../winston");

class MqttEmitter extends EventEmitter {
}

const mqttEmitter = new MqttEmitter();

const mqttFunction = {
    listenMessages: async (message) => {
        logger.info(`Received message from broker: ${message}`);
        try {
            const parts = message.split("::");

            if (parts[0] === "ESP") {
                switch (parts[1]) {
                    case "UPDATE_MAC": {
                        const macAddress = parts[2];
                        const idDoor = parts[3];
                        if (macAddress && idDoor) {
                            logger.info(`Request update MAC: ${macAddress} for Door ID: ${idDoor}`);
                            await doorService.updateMacAddress(idDoor, macAddress);
                        } else {
                            logger.debug("Invalid UPDATE_MAC payload");
                        }
                        break;
                    }
                    case "CHECK_TOKEN": {
                        const macAddress = parts[2];
                        const idDoor = parts[3];
                        if (macAddress && idDoor) {
                            logger.info(`Request check token for door ${idDoor}`);
                            const checkTokenResponse = await tokenService.checkToken(idDoor, macAddress);
                            if (checkTokenResponse[0]) {
                                logger.info(`Update token for door ${idDoor}`);
                                const message = `SERVER::UPDATE_TOKEN::${macAddress}::${idDoor}::${checkTokenResponse[1]}`;
                                mqttEmitter.emit("publish", message);
                            } else if (checkTokenResponse[1]) {
                                logger.info(`Response check token for door ${idDoor}`);
                                const message = `SERVER::RESPONSE_CHECK_TOKEN::${macAddress}::${idDoor}::${checkTokenResponse[1]}`;
                                mqttEmitter.emit("publish", message);
                            } else {
                                logger.info(`Response check token for door ${idDoor} token invalid`);
                                const message = `SERVER::RESPONSE_CHECK_TOKEN::${macAddress}::${idDoor}::TokenInvalid`;
                                mqttEmitter.emit("publish", message);
                            }
                        } else {
                            logger.warn("Invalid CHECK_TOKEN payload");
                        }
                        break;
                    }
                    case "ACCESS_DOOR": {
                        const type = parts[2];
                        const isAccess = parts[3];
                        const uid = parts[4];
                        if (isAccess === "0") {
                            const falseReason = parts[5];
                            logger.warn(`Access door false by ${type}. Reason ${falseReason}`);
                        } else if (isAccess === "1") {
                            const idDoor = parts[5];
                            logger.info(`Access door ${idDoor} by ${type}`);
                        } else {
                            logger.warn("Invalid ACCESS_DOOR payload");
                        }
                        break;
                    }
                    case "REQUEST_ID_DOOR": {
                        const macAddress = parts[2];
                        const idDoor = await doorService.getIdDoor(macAddress);
                        const message = `SERVER::SET_ID_DOOR::${macAddress}::${idDoor}`;
                        mqttEmitter.emit("publish", message);
                        break;
                    }

                    case "RFID": {
                        const type = parts[2];
                        const macAddress = parts[3];
                        const uidCard = parts[4];
                        if (type === "REGISTER") {
                            await doorService.registerRfid(macAddress, uidCard);
                        } else if (type === "REMOVE") {
                            await doorService.removeRfid(macAddress, uidCard);
                        }
                        break;
                    }
                    default:
                        logger.warn("Unknown command from ESP");
                }
            }
        } catch (error) {
            logger.error("Error processing message:", error);
        }
    },

    updateToken: (macAddress, idDoor, token) => {
        if (!macAddress || !idDoor || !token) {
            logger.error("Invalid parameters for update token");
            return;
        }

        const message = `SERVER::UPDATE_TOKEN::${macAddress}::${idDoor}::${token}`;
        mqttEmitter.emit("publish", message);
    },

    registerDoor: (macAddress, idDoor) => {
        if (!macAddress || !idDoor) {
            logger.error("Invalid parameters for register door");
            return;
        }

        const message = `SERVER::SET_ID_DOOR::${macAddress}::${idDoor}`;
        mqttEmitter.emit("publish", message);
    },

    accessDoor: (macAddress, idDoor) => {
        if (!macAddress || !idDoor) {
            logger.error("Invalid parameters for access door");
            return;
        }

        const message = `SERVER::ACCESS_DOOR::${macAddress}::${idDoor}`;
        mqttEmitter.emit("publish", message);
    }
};

module.exports = {mqttFunction, mqttEmitter};