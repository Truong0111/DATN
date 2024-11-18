const tokenService = require("../../Firebase/FirebaseService").tokenService;

module.exports = {
    createToken: async (req, res) => {
        const tokenData = req.body;
        const createToken = await tokenService.createToken(tokenData);
        if (createToken) {
            res.status(200).send({message: `Create token successfully.`});
        } else {
            res.status(400).send({message: `Created token failed.`});
        }
    },
    getToken: async (req, res) => {
        const idToken = req.params.idToken;
        const tokenData = await tokenService.getToken(idToken);
        if (tokenData) {
            res.status(200).send(tokenData);
        } else {
            res.status(400).send({message: `Can't get token.`});
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
            res.status(200).send({message: `Update token successfully.`});
        } else {
            res.status(400).send({message: `Can't update token.`});
        }

    },
    deleteToken: async (req, res) => {
        const idToken = req.params.idToken;
        const deleteSuccess = await tokenService.deleteToken(idToken);
        if (deleteSuccess) {
            res.status(200).send({message: `Delete token successfully.`});
        } else {
            res.status(400).send({message: `Can't delete token.`});
        }
    },
    getTokenByUserId: async (req, res) => {
        const idAccount = req.params.idAccount;
        const tokenDatas = await tokenService.getTokenByUserId(idAccount);
        if (tokenDatas) {
            res.status(200).send(tokenDatas);
        } else {
            res.status(400).send({message: `Can't get token.`});
        }
    },
    getTokenByDoorId: async (req, res) => {
        const idDoor = req.params.idDoor;
        const tokenData = await tokenService.getTokenByDoorId(idDoor);
        if (tokenData) {
            res.status(200).send({tokenData});
        } else {
            res.status(400).send({message: `Can't get token.`});
        }
    },
    getTokenByUserIdAndDoorId: async (req, res) => {
        const idAccount = req.params.idAccount;
        const idDoor = req.params.idDoor;
        const tokenData = await tokenService.getTokenByUserIdAndDoorId(
            idAccount,
            idDoor
        );

        if (tokenData) {
            res.status(200).send({tokenData});
        } else {
            res.status(400).send({message: `Can't get token.`});
        }
    },
    getAllTokens: async (req, res) => {
        const tokens = await tokenService.getAllTokens();
        if (tokens) {
            res.status(200).send(tokens);
        } else {
            res.status(400).send({message: `Can't get tokens.`});
        }
    },
    getTicketWithIdTokenFromServer: async (idToken) => {
        return await tokenService.getTicketWithIdToken(idToken);
    },

    getTokenByIdFromServer: async (idToken) => {
        return await tokenService.getToken(idToken);
    },

    createTokenFromServer: async (tokenData) => {
        return await tokenService.createToken(tokenData);
    },

    updateTokenFromServer: async (idToken, tokenDataUpdate) => {
        return await tokenService.updateToken(idToken, tokenDataUpdate);
    },

    getAllTokensFromServer: async () => {
        return await tokenService.getAllTokens();
    },

    deleteTokenFromServer: async (idToken) => {
        return await tokenService.deleteToken(idToken);
    }
};
