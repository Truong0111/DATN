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
                                const message = `SERVER::UPDATE_TOKEN::${macAddress}::${idDoor}::${checkTokenResponse[1]}`;
                                mqttEmitter.emit("publish", message);
                            } else if (checkTokenResponse[1]) {
                                const message = `SERVER::RESPONSE_CHECK_TOKEN::${macAddress}::${idDoor}::${checkTokenResponse[1]}`;
                                mqttEmitter.emit("publish", message);
                            } else {
                                const message = `SERVER::RESPONSE_CHECK_TOKEN::${macAddress}::${idDoor}::TokenInvalid`;
                                mqttEmitter.emit("publish", message);
                            }
                        } else {
                            logger.warn("Invalid CHECK_TOKEN payload");
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