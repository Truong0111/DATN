const doorService = require("../../Service/DoorService");
const ticketService = require("../../Service/TicketService");

module.exports = {
    createDoor: async (req, res) => {
        const doorData = req.body;
        const createSuccess = await doorService.createDoor(doorData);
        if (createSuccess[0]) {
            res.status(200).send({message: createSuccess[1]});
        } else {
            res.status(400).send({message: createSuccess[1]});
        }
    },

    getDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        const doorData = await doorService.getDoor(idDoor);
        if (doorData) {
            res.status(200).send(doorData);
        } else {
            res.status(400).send({message: `Door has id ${idDoor} not found.`});
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
            res.status(200).send({message: updateSuccess[1]});
        } else {
            res.status(400).send({message: updateSuccess[1]});
        }
    },

    deleteDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        const idAccountDelete = req.body.idAccountDelete;

        const deleteSuccess = await Promise.all([
            doorService.deleteDoor(idAccountDelete, idDoor),
            ticketService.deleteTicketRefIdDoor(idDoor),
        ]);

        if (deleteSuccess) {
            res.status(200).send({message: `Delete door ${idDoor} successful.`});
        } else {
            res.status(400).send({message: `Delete door ${idDoor} failed.`});
        }
    },

    getAllDoors: async (req, res) => {
        const doors = await doorService.getAllDoors();
        if (doors) {
            res.status(200).send(doors);
        } else {
            res.status(404).send({message: "Can't get doors."});
        }
    },
};
