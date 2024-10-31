const tokenService = require("../../Firebase/FirebaseService").tokenService;

module.exports = {
  createToken: async (req, res) => {
    const tokenData = req.body;
    const createSuccess = await tokenService.createToken(tokenData);
    if (createSuccess) {
      res.status(200).send("Create token successful.");
    } else {
      res.status(400).send("Create token failed.");
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
      res.status(200).send("Update token successful.");
    } else {
      res.status(400).send("Update token failed.");
    }
  },
  deleteToken: async (req, res) => {
    const idToken = req.params.idToken;
    const deleteSuccess = await tokenService.deleteToken(idToken);
    if (deleteSuccess) {
      res.status(200).send("Delete token successful.");
    } else {
      res.status(400).send("Delete token failed.");
    }
  },
};
