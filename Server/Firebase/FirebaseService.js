const admin = require("firebase-admin");

const serviceAccount = require("../../key/serviceAccountKey.json");
const googleService = require("../../key/google-services.json");
const constantValue = require("../constants.json");
const util = require("../../utils");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: googleService.project_info.firebase_url,
    });
}

const fsdb = admin.firestore();
const rtdb = admin.database();

const accountCollection = fsdb.collection(constantValue.accountsCollection);
const doorCollection = fsdb.collection(constantValue.doorsCollection);
const ticketCollection = fsdb.collection(constantValue.ticketsCollection);
const logCollection = fsdb.collection(constantValue.logsCollection);
const entryLogCollection = fsdb.collection(constantValue.entryLogsCollection);

// ------------ Account ------------

const accountService = {
    registerAccount,
    loginAccount,
    updateAccount,
    deleteAccount,
    getAccount,
    getAllAccounts,
};

async function registerAccount(accountData) {
    try {
        const accountRef = accountCollection.doc();
        const hashPassword = await util.hashPassword(accountData.password);
        await accountRef.set({
            idAccount: accountRef.id,
            firstName: accountData.firstName,
            lastName: accountData.lastName,
            refId: accountData.refId,
            email: accountData.email,
            phoneNumber: accountData.phoneNumber,
            password: hashPassword,
            arrDoor: [],
            role: ["user"],
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function loginAccount(username, password) {
    try {
        const hashPassword = await util.hashPassword(password);
        let userSnapshot = await accountCollection
            .where("email", "==", username)
            .where("password", "==", hashPassword)
            .get();

        if (userSnapshot.empty) {
            userSnapshot = await accountCollection
                .where("phoneNumber", "==", username)
                .where("password", "==", hashPassword)
                .get();
        }

        if (!userSnapshot.empty) {
            return userSnapshot.docs[0].data();
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

async function updateAccount(idAccount, accountDataUpdate) {
    try {
        const dataToUpdate = {...accountDataUpdate};

        delete dataToUpdate.idAccount;
        if (dataToUpdate.password) {
            dataToUpdate.password = await util.hashPassword(dataToUpdate.password);
        }

        await accountCollection.doc(idAccount).update(dataToUpdate);
        return true;
    } catch (error) {
        return false;
    }
}

async function deleteAccount(idAccountDelete) {
    try {
        await accountCollection.doc(idAccountDelete).delete();
        return true;
    } catch (error) {
        return false;
    }
}

async function getAccount(idAccount) {
    try {
        const accountSnapshot = await accountCollection.doc(idAccount).get();
        return accountSnapshot.data();
    } catch (error) {
        return null;
    }
}

async function getAllAccounts() {
    try {
        const accountsSnapshot = await accountCollection.get();
        return accountsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        return [];
    }
}

// ------------------------------

// ------------ Door ------------

const doorService = {
    createDoor,
    updateDoor,
    getDoor,
    deleteDoor,
    getAllDoors,
};
const rolesToCheck = ["manager", "admin"];

async function createDoor(doorData) {
    try {
        const idAccount = doorData.idAccountCreate;
        const isAccountCanCreateDoor = await isCanCreateDoor(idAccount);
        if (!isAccountCanCreateDoor) {
            return false;
        }

        const doorRef = doorCollection.doc();
        await doorRef.set({
            idDoor: doorRef.id,
            idAccountCreate: doorData.idAccountCreate,
            position: doorData.position,
            createdAt: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function updateDoor(idDoor, doorDataUpdate) {
    try {
        const idAccountCreate = doorDataUpdate.idAccountCreate;

        const isAccountCanUpdateDoor = await isCanUpdateOrDeleteDoor(
            idAccountCreate,
            idDoor
        );

        if (!isAccountCanUpdateDoor) {
            return 0;
        }

        doorDataUpdate.lastUpdate = new Date().toISOString();
        await doorCollection.doc(idDoor).update(doorDataUpdate);
        return 1;
    } catch (error) {
        return -1;
    }
}

async function getDoor(idDoor) {
    try {
        const doorSnapshot = await doorCollection.doc(idDoor).get();
        return doorSnapshot.data();
    } catch (error) {
        return null;
    }
}

async function getAllDoors() {
    try {
        const doorsSnapshot = await doorCollection.get();
        return doorsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        return [];
    }
}

async function deleteDoor(idAccountDelete, idDoor) {
    try {
        const isAccountCanDeleteDoor = await isCanUpdateOrDeleteDoor(
            idAccountDelete,
            idDoor
        );
        if (!isAccountCanDeleteDoor) {
            return false;
        }

        await doorCollection.doc(idDoor).delete();
        return true;
    } catch (error) {
        return false;
    }
}

async function isCanCreateDoor(idAccount) {
    const accountSnapshot = await accountCollection
        .where("idAccount", "==", idAccount)
        .where("role", "array-contains-any", rolesToCheck)
        .get();
    return !accountSnapshot.empty;

}

async function isCanUpdateOrDeleteDoor(idAccount, idDoor) {
    const doorSnapShot = await doorCollection
        .where("idDoor", "==", idDoor)
        .where("idAccountCreate", "==", idAccount)
        .get();
    return !doorSnapShot.empty;

}

// ------------------------------

// ------------ Ticket ------------

const ticketService = {
    createTicket,
    updateTicket,
    getTicket,
    deleteTicket,
    getTickets,
    getAllTickets,
};

async function createTicket(ticketData) {
    try {
        const ticketRef = ticketCollection.doc();
        const idTicket = ticketRef.id;

        if (!isTicketValid(ticketData.startTime, ticketData.endTime)) {
            return false;
        }

        await ticketRef.set({
            idTicket: idTicket,
            idDoor: ticketData.idDoor,
            idAccount: ticketData.idAccount,
            startTime: ticketData.startTime,
            endTime: ticketData.endTime,
            reason: ticketData.reason,
            createdAt: new Date().toISOString(),
            isAccept: false,
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function updateTicket(idTicket, ticketDataUpdate) {
    try {
        const ticketData = await getTicket(idTicket);

        if (!isTicketValid(ticketData.startTime, ticketData.endTime)) {
            return false;
        }

        const dataToUpdate = {...ticketDataUpdate};

        delete dataToUpdate.idTicket;
        delete dataToUpdate.idDoor;
        delete dataToUpdate.idAccount;

        await ticketCollection.doc(idTicket).update(dataToUpdate);
        return true;
    } catch (error) {
        return false;
    }
}

async function getTicket(idTicket) {
    try {
        const ticketSnapshot = await ticketCollection.doc(idTicket).get();
        return ticketSnapshot.data();
    } catch (error) {
        return null;
    }
}

async function deleteTicket(idTicket) {
    try {
        await ticketCollection.doc(idTicket).delete();
        return true;
    } catch (error) {
        return false;
    }
}

function isTicketValid(startTime, endTime) {
    const timeStart = new Date(startTime).getTime();
    const timeEnd = new Date(endTime).getTime();
    return timeStart <= timeEnd;
}

async function getTickets(idAccount) {
    try {
        const ticketsSnapshot = await ticketCollection
            .where("idAccount", "==", idAccount)
            .get();
        return ticketsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        return [];
    }
}

async function getAllTickets() {
    try {
        const ticketsSnapshot = await ticketCollection.get();
        return ticketsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        return [];
    }
}

// ------------------------------

// ------------ Log ------------

const logService = {
    createLog,
    getLog,
    deleteLog,
};

const typeLog = ["account", "door", "ticket", "token", "entry"];

async function createLog(logData) {
    try {
        const logRef = logCollection.doc();
        const idLog = logRef.id;

        await logRef.set({
            idLog: idLog,
            type: logData.type,
            info: logData.info,
        });

        return true;
    } catch (error) {
        return false;
    }
}

async function getLog(idLog) {
    try {
        const logSnapshot = await logCollection.doc(idLog).get();
        return logSnapshot.data();
    } catch (error) {
        return null;
    }
}

async function deleteLog(idLog) {
    try {
        await logCollection.doc(idLog).delete();
        return true;
    } catch (error) {
        return false;
    }
}

// ------------------------------

// ------------ Token ------------

const tokenService = {
    createToken,
    getToken,
    updateToken,
    deleteToken,
    getTokenByUserId,
    getTokenByDoorId,
    getTokenByUserIdAndDoorId,
    getAllTokens,
};

async function createToken(tokenData) {
    try {
        const keyToken = `${tokenData.idDoor}-${tokenData.idAccount}`;
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
        await tokenRef.update({value: tokenDataUpdate.expiredTime});
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
            if (idToken.split("-")[1] === idAccount) {
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
            if (idToken.split("-")[0] === idDoor) {
                return tokens[idToken];
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function getTokenByUserIdAndDoorId(idAccount, idDoor) {
    const keyToken = `${idDoor}-${idAccount}`;
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

// ------------------------------

module.exports = {
    accountService,
    doorService,
    ticketService,
    tokenService,
    logService,
};
