const tokenService = require("../../Service/TokenService");

module.exports = {
    createToken: async (idDoor, token, timeStamp) => {
        return await tokenService.createToken(idDoor, token, timeStamp);
    },

    getTokenById: async (idDoor) => {
        return await tokenService.getToken(idDoor);
    },

    checkToken : async (idDoor, token) => {
        return await tokenService.checkToken(idDoor, token);
    },

    updateToken: async (idDoor, token, timeStamp) => {
        return await tokenService.updateToken(idDoor, token, timeStamp);
    },

    deleteToken: async (idDoor) => {
        return await tokenService.deleteToken(idDoor);
    },

    getAllTokens: async () => {
        return await tokenService.getAllTokens();
    },
};
