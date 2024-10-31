const doorService = require("../../Firebase/FirebaseService").doorService;

module.exports = {
  createDoor: async (req, res) => {
    const doorData = req.body;
    const createSuccess = await doorService.createDoor(doorData);
    if (createSuccess) {
      res.status(200).send("Create door successful.");
    } else {
      res.status(400).send("Create door failed.");
    }
  },
  getDoor: async (req, res) => {
    const idDoor = req.params.idDoor;
    const deleteSuccess = await doorService.getDoor(idDoor);
    if (deleteSuccess) {
      res.status(200).send("Delete door successful.");
    } else {
      res.status(404).send("Door not found.");
    }
  },
  updateDoor: async (req, res) => {
    console.log(req.params);
    console.log(req.body);

    const idDoor = req.params.idDoor;
    const doorDataUpdate = req.body;
    
    const updateSuccess = await doorService.updateDoor(
      idDoor,
      doorDataUpdate
    );
    if (updateSuccess) {
      res.status(200).send("Update door successful.");
    } else {
      res.status(400).send("Update door failed.");
    }
  },

  deleteDoor: async (req, res) => {
    const idAccountDelete = req.body.idAccount;
    const idDoor = req.params.idDoor;
    const deleteSuccess = await doorService.deleteDoor(idAccountDelete, idDoor);
    if (deleteSuccess) {
      res.status(200).send("Delete door successful.");
    } else {
      res.status(400).send("Delete door failed.");
    }
  },
};
