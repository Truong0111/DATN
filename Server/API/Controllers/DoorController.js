const doorService = require("../../Service/DoorService");
const ticketService = require("../../Service/TicketService");
const {mqttFunction} = require("../../Service/MqttService");
const logger = require("../../winston");

module.exports = {
    createDoor: async (req, res) => {
        const doorData = req.body;
        logger.info(`Request: create door from ${req.ip}`)
        const createSuccess = await doorService.createDoor(doorData);
        if (createSuccess[0]) {
            logger.info(`Response: Door ${createSuccess[2]} created successfully for ${req.ip}.`)
            mqttFunction.registerDoor(doorData.macAddress, createSuccess[2]);
            res.status(200).json({message: createSuccess[1]});
        } else {
            logger.warn(`Response: Failed to create door for ${req.ip}`, {message: createSuccess[1]});
            res.status(400).json({message: createSuccess[1]});
        }
    },

    accessDoor: async (req, res) => {
        const idDoor = req.query.idDoor;
        const idAccount = req.query.idAccount;
        const token = req.body.token;
        logger.info(`Request: access door from ${req.ip}`);

        if (!idDoor || !idAccount) {
            logger.alert(`Response: Missing idDoor or idAccount on request body from ${req.ip}`);
            return res.status(400).json({message: 'Missing idDoor or idAccount'});
        }

        if (!token) {
            logger.alert(`Response: Missing token on request body from ${req.ip}`);
            return res.status(400).json({message: 'Missing token'});
        }

        logger.info(`Request: access door ${idDoor} by account ${idAccount} from ${req.ip}`);
        const accessSuccess = await doorService.accessDoor(idDoor, idAccount, token);
        if (accessSuccess[0]) {
            logger.info(`Response: Door ${idDoor} accessed successfully for ${idAccount} from ${req.ip}.`);
            mqttFunction.accessDoor(accessSuccess[1], idDoor);
            res.status(200).json({message: "Access granted"});
        } else {
            logger.warn(`Response: Failed to access door ${idDoor} by account ${idAccount} from ${req.ip}`, {message: accessSuccess[1]});
            res.status(400).json({message: "You are not allowed to access this door."});
        }
    },

    getDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        logger.info(`Request: Get door data of ${idDoor} from ${req.ip}`);
        const doorData = await doorService.getDoor(idDoor);
        if (doorData) {
            logger.info(`Response: Get door data of ${idDoor} successfully for ${req.ip}`)
            res.status(200).json(doorData);
        } else {
            logger.warn(`Response: Door ${idDoor} not found from ${req.ip}`);
            res.status(400).json({message: `Door has id ${idDoor} not found.`});
        }
    },

    updateDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        const doorDataUpdate = req.body;

        logger.info(`Request: Update door data of ${idDoor} from ${req.ip}`);
        const updateSuccess = await doorService.updateDoor(
            idDoor,
            doorDataUpdate
        );

        if (updateSuccess[0]) {
            logger.info(`Response: Update door data of ${idDoor} successfully for ${req.ip}`);
            res.status(200).json({message: updateSuccess[1]});
        } else {
            logger.warn(`Response: Failed to update door data of ${idDoor} from ${req.ip}`, {message: updateSuccess[1]});
            res.status(400).json({message: updateSuccess[1]});
        }
    },

    deleteDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        const idAccountDelete = req.body.idAccountDelete;
        logger.info(`Request: Delete door ${idDoor} from ${req.ip}`);
        const deleteSuccess = await Promise.any([
            doorService.deleteDoor(idAccountDelete, idDoor),
            ticketService.deleteTicketRefIdDoor(idDoor),
        ]);

        if (deleteSuccess) {
            logger.info(`Response: Delete door ${idDoor} successfully for ${req.ip}`);
            res.status(200).json({message: `Delete door ${idDoor} successful.`});
        } else {
            logger.warn(`Response: Failed to delete door ${idDoor} from ${req.ip}`);
            res.status(400).json({message: `Delete door ${idDoor} failed.`});
        }
    },

    getAllDoors: async (req, res) => {
        logger.info(`Request: Get all doors from ${req.ip}`);
        const doors = await doorService.getAllDoors();
        if (doors) {
            logger.info(`Response: Get all doors successfully for ${req.ip}`);
            res.status(200).json(doors);
        } else {
            logger.warn(`Response: Can't get doors from ${req.ip}`);
            res.status(404).json({message: "Can't get doors."});
        }
    },

    addAccountAccessDoor: async (req, res) => {
        const idDoor = req.body.idDoor;
        const idAccounts = req.body.accounts;
        logger.info(`Request: Add accounts to access door ${idDoor} from ${req.ip}`);
        const addSuccess = await ticketService.addAccountsAccessDoor(idDoor, idAccounts);
        if (addSuccess.success) {
            logger.info(`Response: Add accounts to access door successfully for ${req.ip}`);
            res.status(200).json({
                message: "Add accounts to access door successful",
                failedAccounts: addSuccess.failedAccounts
            });
        } else {
            logger.warn(`Response: Add accounts to access door failed from ${req.ip}`);
            res.status(404).json({
                message: "Add accounts to access door failed",
                failedAccounts: addSuccess.failedAccounts
            });
        }
    },

    removeAccountAccessDoor: async (req, res) => {
        const idDoor = req.body.idDoor;
        const idAccounts = req.body.accounts;
        logger.info(`Request: Remove accounts access door ${idDoor} from ${req.ip}`);
        const addSuccess = await ticketService.removeAccountsAccessDoor(idDoor, idAccounts);

        if (addSuccess.success) {
            logger.info(`Response: Remove accounts to access door successfully for ${req.ip}`);
            res.status(200).json({
                message: "Remove accounts to access door successful",
                failedAccounts: addSuccess.failedAccounts
            });
        } else {
            logger.warn(`Response: Remove accounts to access door failed from ${req.ip}`);
            res.status(404).json({
                message: "Remove accounts to access door failed",
                failedAccounts: addSuccess.failedAccounts
            });
        }
    },

    getAccountsCanAccessDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        logger.info(`Request: Get accounts access doors ${idDoor} from ${req.ip}`);
        const getSuccess = await doorService.getAccountsCanAccessDoor(idDoor);
        if (getSuccess) {
            logger.info(`Response: Get accounts can access door successfully for ${req.ip}`);
            res.status(200).json(getSuccess);
        } else {
            logger.warn(`Response: Get accounts can access door failed from ${req.ip}`);
            res.status(404).json({message: "Get accounts can access door failed"});
        }
    },

    openDoor: async (req, res) => {
        const idDoor = req.body.idDoor;
        const idAccount = req.body.idAccount;
        logger.info(`Request: Open door ${idDoor} from ${req.ip}`);
        const macDoor = await doorService.openDoor(idDoor, idAccount);
        if (macDoor) {
            logger.info(`Response: Get door data of ${idDoor} successfully for ${req.ip}`)
            mqttFunction.accessDoor(macDoor, idDoor);
            res.status(200).json({message: "Open door successfully."});
        } else {
            logger.warn(`Response: Door ${idDoor} not found from ${req.ip}`);
            res.status(400).json({message: `Door has id ${idDoor} not found.`});
        }
    },
};
