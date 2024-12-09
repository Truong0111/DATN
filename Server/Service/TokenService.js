const admin = require("firebase-admin");
const constantValue = require("../constants.json");

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
        return true;
    } catch (error) {
        return false;
    }
}

async function getToken(idDoor) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`);
        const snapshot = await tokenRef.once("value");

        if (!snapshot.exists()) {
            return false;
        }

        return snapshot.val();
    } catch (error) {
        return false;
    }
}

async function checkToken(idDoor, token) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`);
        const snapshot = await tokenRef.once("value");

        if (!snapshot.exists()) {
            return [false, null];
        }

        const currentToken = snapshot.val().value;

        if(currentToken === token){
            return [false, currentToken];
        }
        else{
            return [true, currentToken];
        }
    } catch (error) {
        return [false];
    }
}

async function updateToken(idDoor, token, timeStamp) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`);

        await tokenRef.update({
            value: token,
            timeStamp: timeStamp
        });

        return true;
    } catch (error) {
        return false;
    }
}

async function deleteToken(idDoor) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`);
        await tokenRef.remove();
        return true;
    } catch (error) {
        return false;
    }
}

async function getAllTokens() {
    try {
        const tokensRef = rtdb.ref(constantValue.tokensCollection);
        const snapshot = await tokensRef.once("value");
        return snapshot.val();
    } catch (error) {
        return null;
    }
}
