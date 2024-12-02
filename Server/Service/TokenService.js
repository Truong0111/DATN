const admin = require("firebase-admin");
const constantValue = require("../constants.json");

const fsdb = admin.firestore();
const rtdb = admin.database();


module.exports = {
    createToken,
    getToken,
    updateToken,
    deleteToken,
    getTokenByUserId,
    getTokenByDoorId,
    getTokenByUserIdAndDoorId,
    getAllTokens,
    getTicketWithIdToken,
    publishIP
};

const accountCollection = fsdb.collection(constantValue.accountsCollection);
const doorCollection = fsdb.collection(constantValue.doorsCollection);
const ticketCollection = fsdb.collection(constantValue.ticketsCollection);
const ipCollection = fsdb.collection(constantValue.ipCollection);

async function createToken(tokenData) {
    try {
        const keyToken = `${tokenData.idDoor}_${tokenData.idAccount}`;
        const expiredTime = tokenData.expiredTime;

        const doorRef = doorCollection.doc(tokenData.idDoor);
        const doorSnapshot = await doorRef.get();
        const doorData = doorSnapshot.data();

        const accountRef = accountCollection.doc(tokenData.idAccount);
        const accountSnapshot = await accountRef.get();
        const accountData = accountSnapshot.data();

        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${keyToken}`);
        await tokenRef.set({
            value: doorData.position + "_" + accountData.refId + "_" + expiredTime,
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function getToken(idToken) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idToken}`);
        const data = await tokenRef.once("value");
        return data.val();
    } catch (error) {
        return false;
    }
}

async function updateToken(idToken, tokenDataUpdate) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idToken}`);

        const doorRef = doorCollection.doc(tokenDataUpdate.idDoor);
        const doorSnapshot = await doorRef.get();
        const doorData = doorSnapshot.data();

        const accountRef = accountCollection.doc(tokenDataUpdate.idAccount);
        const accountSnapshot = await accountRef.get();
        const accountData = accountSnapshot.data();

        await tokenRef.update({value: `${doorData}_${accountData}_${tokenDataUpdate.expiredTime}`});
        return true;
    } catch (error) {
        return false;
    }
}

async function deleteToken(idToken) {
    try {
        const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idToken}`);
        await tokenRef.remove();
        return true;
    } catch (error) {
        return false;
    }
}

async function getTokenByUserId(idAccount) {
    try {
        const tokensRef = rtdb.ref(constantValue.tokensCollection);
        const snapshot = await tokensRef.once("value");
        const tokens = snapshot.val();

        if (!tokens) return [];

        const result = [];

        for (const idToken in tokens) {
            if (idToken.split("_")[1] === idAccount) {
                result.push({
                    idToken: idToken,
                    tokenData: tokens[idToken]
                });
            }
        }
        return result;
    } catch (error) {
        return null;
    }
}

async function getTokenByDoorId(idDoor) {
    try {
        const tokensRef = rtdb.ref(constantValue.tokensCollection);
        const snapshot = await tokensRef.once("value");
        const tokens = snapshot.val();

        if (!tokens) return null;

        for (const idToken in tokens) {
            if (idToken.split("_")[0] === idDoor) {
                return tokens[idToken];
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function getTokenByUserIdAndDoorId(idAccount, idDoor) {
    const keyToken = `${idDoor}_${idAccount}`;
    return await getToken(keyToken);
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

async function getTicketWithIdToken(idToken) {
    try {
        const [idDoor, idAccount] = idToken.split('_');
        const ticketSnapshot = await ticketCollection
            .where("idDoor", "==", idDoor)
            .where("idAccount", "==", idAccount)
            .get();
        return ticketSnapshot.docs[0].data();
    } catch (error) {
        return null;
    }
}

async function publishIP(ip) {
    try {
        const ipRef = rtdb.ref(`${constantValue.ipCollection}`);
        await ipRef.set(ip);
        return true;
    } catch (error) {
        return false;
    }
}
