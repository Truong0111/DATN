const admin = require("firebase-admin");
const constantValue = require("../constants.json");
const logger = require("../winston");
const rtdb = admin.database();


module.exports = {
    createToken,
    getToken,
    updateToken,
    deleteToken,
    getAllTokens,
    checkToken,
};


async function createToken(idDoor, token, timeStamp) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`);
        await tokenRef.set({
            value: token,
            timeStamp: timeStamp,
        });
        logger.info(`Create new token for door ${idDoor}`, {token: token});
        return true;
    } catch (error) {
        logger.error(`Error when creating new token for door ${idDoor}`, error);
        return false;
    }
}

async function getToken(idDoor) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`);
        const snapshot = await tokenRef.once("value");

        if (!snapshot.exists()) {
            logger.warn(`No token found for ${idDoor}`);
            return false;
        }
        return snapshot.val();
    } catch (error) {

        logger.error(`Error when getting token for ${idDoor}`, error);
        return false;
    }
}

async function checkToken(idDoor, token) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`);
        const snapshot = await tokenRef.once("value");

        if (!snapshot.exists()) {
            logger.warn(`No token found for ${idDoor}`);
            return [false, null];
        }

        const currentToken = snapshot.val().value;

        if(currentToken === token){
            logger.info(`Token ${token} is correct for ${idDoor}`, {tokenCheck: token, currentToken: currentToken});
            return [false, currentToken];
        }
        else{
            logger.info(`Token ${token} is incorrect for ${idDoor}`, {tokenCheck: token, currentToken: currentToken});
            return [true, currentToken];
        }
    } catch (error) {
        logger.error(`Error when checking token for ${idDoor}`, error);
        return [false, null];
    }
}

async function updateToken(idDoor, token, timeStamp) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`);

        await tokenRef.update({
            value: token,
            timeStamp: timeStamp
        });

        logger.info(`Update token for ${idDoor}`, {token: token});

        return true;
    } catch (error) {

        logger.error(`Error when updating token for ${idDoor}`, error);
        return false;
    }
}

async function deleteToken(idDoor) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`);
        await tokenRef.remove();
        logger.info(`Delete token for ${idDoor}`);
        return true;
    } catch (error) {
        logger.error(`Error when deleting token for ${idDoor}`);
        return false;
    }
}

async function getAllTokens() {
    try {
        const tokensRef = rtdb.ref(constantValue.tokensCollection);
        const snapshot = await tokensRef.once("value");

        if (!snapshot.exists()) {
            logger.warn('No tokens found');
            return null;
        }

        return snapshot.val();
    } catch (error) {
        logger.error('Error when getting all tokens', error);
        return null;
    }
}
