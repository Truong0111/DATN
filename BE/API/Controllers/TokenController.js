const tokenService = require("../../Firebase/FirebaseService").tokenService;

module.exports = {
  createToken: async (tokenData) => {
    const createSuccess = await tokenService.createToken(tokenData);
    if (createSuccess) {
      return true;
    } else {
      return false;
    }
  },
  getToken: async (idToken) => {
    const token = await tokenService.getToken(idToken);
    return token;
  },
  updateToken: async (idToken, tokenDataUpdate) => {
    const updateSuccess = await tokenService.updateToken(
      idToken,
      tokenDataUpdate
    );
    if (updateSuccess) {
      return true;
    } else {
      return false;
    }
  },
  deleteToken: async (idToken) => {
    const deleteSuccess = await tokenService.deleteToken(idToken);
    if (deleteSuccess) {
      return true;
    } else {
      return false;
    }
  },
  getTokenByUserId: async (idAccount) => {
    const token = await tokenService.getTokenByUserId(idAccount);
    return token;
  },
  getTokenByDoorId: async (idDoor) => {
    const token = await tokenService.getTokenByDoorId(idDoor);
    return token;
  },
  getTokenByUserIdAndDoorId: async (idAccount, idDoor) => {
    const token = await tokenService.getTokenByUserIdAndDoorId(
      idAccount,
      idDoor
    );
    return token;
  },
  getAllTokens: async () => {
    const tokens = await tokenService.getAllTokens();
    return tokens;
  },
};
