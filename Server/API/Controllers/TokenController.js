const tokenService = require("../../Service/TokenService");
const logger = require("../../winston");

module.exports = {
    getTokenById: async (req, res) => {
        const idDoor = req.params.idDoor;
        logger.info(`Request: get token data from ${req.ip}`)
        const token  = await tokenService.getToken(idDoor);
        if (token){
            logger.info(`Response: Get token data successfully for ${req.ip}`);
            res.status(200).json(token);
        }
        else{
            logger.warn(`Response: Token not found for ${req.ip}`);
            res.status(204).json({message: "Token not found."});
        }
    },

    getAllTokens: async (req, res) => {
        logger.info(`Request: get all token data from ${req.ip}`)
        const tokens  = await tokenService.getAllTokens();

        if (tokens){
            logger.info(`Response: Get all tokens data successfully for ${req.ip}`);
            res.status(200).json(tokens);
        }
        else{
            logger.warn(`Response: Token not found for ${req.ip}`);
            res.status(204).json({message: "Token not found."});
        }
    },
};
