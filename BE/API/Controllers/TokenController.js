const tokenService = require("../firestoreService");

module.exports = {
  createToken: async (req, res) => {
    const tokenData = req.body;
    const createSuccess = await tokenService.createToken(tokenData);
    if (createSuccess) {
      res.status(200).send("Create successful.");
    } else {
      res.status(400).send("Create failed.");
    }
  },
  getToken: async (req, res) => {
    const idToken = req.params.idToken;
    const token = await tokenService.getToken(idToken);
    if (token) {
      res.status(200).send(token);
    } else {
      res.status(404).send("Token not found.");
    }
  },
  updateToken: async (req, res) => {
    const idToken = req.params.idToken;
    const tokenDataUpdate = req.body;
    const updateSuccess = await tokenService.updateToken(
      idToken,
      tokenDataUpdate
    );
    if (updateSuccess) {
      res.status(200).send("Update successful.");
    } else {
      res.status(400).send("Update failed.");
    }
  },
  deleteToken: async (req, res) => {
    const idToken = req.params.idToken;
    const deleteSuccess = await tokenService.deleteToken(idToken);
    if (deleteSuccess) {
      res.status(200).send("Delete successful.");
    } else {
      res.status(400).send("Delete failed.");
    }
  },
};
