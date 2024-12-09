const doorService = require("../../Service/DoorService");
const ticketService = require("../../Service/TicketService");
const {accountService} = require("../../Service/AccountService");
const {mqttFunction} = require("../../Service/MqttService");


module.exports = {
    createDoor: async (req, res) => {
        const doorData = req.body;
        const createSuccess = await doorService.createDoor(doorData);
        if (createSuccess[0]) {
            mqttFunction.registerDoor(doorData.macAddress, createSuccess[2]);
            res.status(200).json({message: createSuccess[1]});
        } else {
            res.status(400).json({message: createSuccess[1]});
        }
    },

    accessDoor: async (req, res) => {
        const idDoor = req.query.idDoor;
        const idAccount = req.query.idAccount;
        const token = req.body.token;

        if (!idDoor || !idAccount) {
            return res.status(400).json({message: 'Missing idDoor or idAccount'});
        }

        if (!token) {
            return res.status(400).json({message: 'Missing token'});
        }

        const accessSuccess = await doorService.accessDoor(idDoor, idAccount, token);
        if (accessSuccess[0]) {
            mqttFunction.accessDoor(accessSuccess[1], idDoor);
            res.status(200).json({message: "Access granted"});
        } else {
            res.status(400).json({message: "You are not allowed to access this door."});
        }
    },

    getDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        const doorData = await doorService.getDoor(idDoor);
        if (doorData) {
            res.status(200).json(doorData);
        } else {
            res.status(400).json({message: `Door has id ${idDoor} not found.`});
        }
    },

    updateDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        const doorDataUpdate = req.body;

        const updateSuccess = await doorService.updateDoor(
            idDoor,
            doorDataUpdate
        );

        if (updateSuccess[0]) {
            res.status(200).json({message: updateSuccess[1]});
        } else {
            res.status(400).json({message: updateSuccess[1]});
        }
    },

    deleteDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        const idAccountDelete = req.body.idAccountDelete;


        const deleteSuccess = await Promise.any([
            doorService.deleteDoor(idAccountDelete, idDoor),
            ticketService.deleteTicketRefIdDoor(idDoor),
        ]);

        if (deleteSuccess) {
            res.status(200).json({message: `Delete door ${idDoor} successful.`});
        } else {
            res.status(400).json({message: `Delete door ${idDoor} failed.`});
        }
    },

    getAllDoors: async (req, res) => {
        const doors = await doorService.getAllDoors();
        if (doors) {
            res.status(200).json(doors);
        } else {
            res.status(404).json({message: "Can't get doors."});
        }
    },

    updateMacAddress: async (idDoor, macAddress) => {
        return await doorService.updateMacAddress(idDoor, macAddress);
    },

    addAccountCanAccess: async (idDoor, idAccount) => {
        return await doorService.addAccountCanAccess(idDoor, idAccount);
    },

    removeAccountCanAccess: async (idDoor, idAccount) => {
        return await doorService.removeAccountCanAccess(idDoor, idAccount);
    },

    updateDoorStatus: async (idDoor, status) => {
        return await doorService.updateDoorStatus(idDoor, status);
    }
};
