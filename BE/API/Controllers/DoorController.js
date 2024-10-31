const doorService = require("../../Firebase/FirebaseService").doorService;

module.exports = {
  createDoor: async (req, res) => {
    const doorData = req.body;
    const createSuccess = await doorService.createDoor(doorData);
    if (createSuccess) {
      res.status(200).send(`Create door at ${doorData.position} successful.`);
    } else {
      res.status(400).send(`Create door at ${doorData.position} failed.`);
    }
  },
  getDoor: async (req, res) => {
    const idDoor = req.params.idDoor;
    const doorData = await doorService.getDoor(idDoor);
    if (doorData) {
      res.status(200).send(doorData);
    } else {
      res.status(404).send(`Door has id ${idDoor} not found.`);
    }
  },
  updateDoor: async (req, res) => {
    const idDoor = req.params.idDoor;
    const doorDataUpdate = req.body;
    
    const updateSuccess = await doorService.updateDoor(
      idDoor,
      doorDataUpdate
    );
    if (updateSuccess) {
      res.status(200).send(`Update door ${idDoor} successful.`);
    } else {
      res.status(400).send(`Update door ${idDoor} failed.`);
    }
  },

  deleteDoor: async (req, res) => {
    const idDoor = req.params.idDoor;
    const idAccountDelete = req.body.idAccountDelete;
    
    const deleteSuccess = await doorService.deleteDoor(idAccountDelete, idDoor);
    if (deleteSuccess) {
      res.status(200).send(`Delete door ${idDoor} successful.`);
    } else {
      res.status(400).send(`Delete door ${idDoor} failed.`);
    }
  },
};
