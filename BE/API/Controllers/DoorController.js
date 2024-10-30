const doorService = require("../firestoreService");

module.exports = {
  createDoor: async (req, res) => {
    const idAccountCreate = req.params.idAccountCreate;
    const doorData = req.body;
    const createSuccess = await doorService.createDoor(
      idAccountCreate,
      doorData
    );
    if (createSuccess) {
      res.status(200).send("Create successful.");
    } else {
      res.status(400).send("Create failed.");
    }
  },

  getDoor: async (req, res) => {
    const idDoor = req.params.idDoor;
    const door = await doorService.getDoor(idDoor);
    if (door) {
      res.status(200).send(door);
    } else {
      res.status(404).send("Door not found.");
    }
  },
  updateDoor: async (req, res) => {
    const idAccountCreate = req.params.idAccountCreate;
    const idDoor = req.params.idDoor;
    const doorDataUpdate = req.body;
    const updateSuccess = await doorService.updateDoor(
      idAccountCreate,
      idDoor,
      doorDataUpdate
    );
    if (updateSuccess) {
      res.status(200).send("Update successful.");
    } else {
      res.status(400).send("Update failed.");
    }
  },

  deleteDoor: async (req, res) => {
    const idAccountDelete = req.params.idAccountDelete;
    const idDoor = req.params.idDoor;
    const deleteSuccess = await doorService.deleteDoor(idAccountDelete, idDoor);
    if (deleteSuccess) {
      res.status(200).send("Delete successful.");
    } else {
      res.status(400).send("Delete failed.");
    }
  },
};
