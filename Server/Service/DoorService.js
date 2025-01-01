const admin = require("firebase-admin");
const constantValue = require("../constants.json");
const {FieldValue} = require('firebase-admin/firestore');
const logger = require("../winston");

const fsdb = admin.firestore();
const rtdb = admin.database();

const accountCollection = fsdb.collection(constantValue.accountsCollection);
const doorCollection = fsdb.collection(constantValue.doorsCollection);
const doorAccessCollection = fsdb.collection(constantValue.doorsAccessCollection);

module.exports = {
    createDoor,
    updateDoor,
    getDoor,
    deleteDoor,
    getAllDoors,
    updateMacAddress,
    getIdDoor,
    openDoor,
    accessDoor,
    addAccountCanAccess,
    removeAccountCanAccess,
    isAccountCanAccessDoor,
    registerRfid,
    removeRfid,
    addAccountsAccessDoor,
    removeAccountsAccessDoor,
    getAccountsCanAccessDoor,
};

async function createDoor(doorData) {
    try {
        const idAccount = doorData.idAccountCreate;
        const isAccountCanCreateDoor = await isCanCreateDoor(idAccount);
        if (!isAccountCanCreateDoor) {
            logger.warn(`Account can't create door ${idAccount}`);
            return [false, `You can't register door`];
        }

        const doorExist = await isDoorExist(doorData.position);
        if (doorExist) {
            logger.warn(`Door ${doorData.position} already exists`);
            return [false, `Door at ${doorData.position} is exist.`];
        }

        const doorRef = doorCollection.doc();
        await doorRef.set({
            idDoor: doorRef.id,
            idAccountCreate: doorData.idAccountCreate,
            macAddress: doorData.macAddress,
            position: doorData.position,
            status: true,
            createdAt: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
        });

        const doorAccessRef = await doorAccessCollection.doc(doorRef.id);
        await doorAccessRef.set({
            idAccountsCanAccess: [doorData.idAccountCreate],
        })

        logger.info(`Door at ${doorData.position} is created successfully by ${idAccount}.`);
        return [true, `Door at ${doorData.position} create successfully.`, doorRef.id];
    } catch (error) {
        logger.error(`Error when creating door: ${error.message}`);
        return [false, `Has error when creating door.`];
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
            logger.warn(`Account ${idAccountCreate} can't edit door ${idDoor}. `);
            return [false, `Door is created by another. You don't have permission to update this door.`];
        }

        const doorExist = await isDoorExist(doorDataUpdate.position);
        const oldPosition = (await doorCollection.doc(idDoor).get()).data().position;

        if (doorExist) {
            if (oldPosition === doorDataUpdate.position) {
                delete doorDataUpdate.position;
            } else {
                return [false, `Door at ${doorDataUpdate.position} is exist.`];
            }
        }

        doorDataUpdate.lastUpdate = new Date().toISOString();
        await doorCollection.doc(idDoor).update(doorDataUpdate);

        logger.info(`Door is changed from ${oldPosition} to ${doorDataUpdate.position} by ${idAccountCreate}`);
        return [true, `Door is changed from ${oldPosition} to ${doorDataUpdate.position}`];

    } catch (error) {
        logger.error(`Error when updating door: ${error.message}`);
        return [false, `Has error when updating door.`];
    }
}

async function getDoor(idDoor) {
    try {
        const doorSnapshot = await doorCollection.doc(idDoor).get();
        return doorSnapshot.data();
    } catch (error) {
        logger.error(`Error when getting door ${idDoor}: ${error.message}`);
        return null;
    }
}

async function getAllDoors() {
    try {
        const doorsSnapshot = await doorCollection.get();
        return doorsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        logger.error(`Error when getting all doors: ${error.message}`);
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
            logger.warn(`Account ${idAccountDelete} can't delete door ${idDoor}.`);
            return false;
        }

        await doorCollection.doc(idDoor).delete();
        await doorAccessCollection.doc(idDoor).delete();

        logger.info(`Door ${idDoor} deleted by ${idAccountDelete}`);
        return true;

    } catch (error) {
        logger.error(`Error when deleting door by ${idAccountDelete}: ${error.message}`);
        return false;
    }
}

async function isDoorExist(position) {
    const doorSnapshot = await doorCollection
        .where("position", "==", position)
        .get();
    return !doorSnapshot.empty;
}

async function updateMacAddress(idDoor, macAddress) {
    try {
        await doorCollection.doc(idDoor).update({
            macAddress: macAddress,
        });
        logger.info(`Update mac address for ${idDoor} success`);
        return true
    } catch (error) {
        logger.error(`Error when update mac address for ${idDoor}: ${error.message}`);
        return false;
    }
}

async function updateDoorStatus(idDoor, status) {
    try {
        await doorCollection.doc(idDoor).update({
            status: status,
        });
        logger.info(`Update door status for ${idDoor} success`);
        return true;
    } catch (error) {
        logger.error(`Error when update door status for ${idDoor}: ${error.message}`);
        return false;
    }
}

async function isCanCreateDoor(idAccount) {
    const accountSnapshot = await accountCollection
        .where("idAccount", "==", idAccount)
        .where("role", "array-contains-any", constantValue.roleToCheck)
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

async function getIdDoor(macAddress) {
    const doorSnapshot = await doorCollection
        .where("macAddress", "==", macAddress)
        .get();

    if (doorSnapshot.empty) {
        logger.warn(`Door with mac address ${macAddress} is not exist`);
        return null;
    }

    return doorSnapshot.docs[0].id;
}

// Door Access Functions
async function registerRfid(macAddress, uid) {
    try {
        const doorSnapshot = await doorCollection
            .where("macAddress", "==", macAddress)
            .get();

        const idDoor = doorSnapshot.docs[0].id

        await doorAccessCollection.doc(idDoor).update({
            rfidCanAccess: FieldValue.arrayUnion(uid),
        });
        logger.info(`Add rfid ${uid} can access door ${idDoor}`);
        return true;
    } catch (error) {
        logger.error(`Error when add rfid ${uid} can access door ${macAddress}`);
        return false;
    }
}

async function removeRfid(macAddress, uid) {
    try {
        const doorSnapshot = await doorCollection
            .where("macAddress", "==", macAddress)
            .get();

        const idDoor = doorSnapshot.docs[0].id

        await doorAccessCollection.doc(idDoor).update({
            rfidCanAccess: FieldValue.arrayRemove(uid),
        });

        logger.info(`Remove rfid ${uid} can access door ${idDoor}`);
        return true;
    } catch (error) {
        logger.error(`Error when remove rfid ${uid} can access door ${macAddress}`);
        return false;
    }
}

async function addAccountsAccessDoor(idDoor, idAccounts) {
    const failedAccounts = [];

    try {
        for (const idAccount of idAccounts) {
            try {
                await addAccountCanAccess(idDoor, idAccount);
            } catch (error) {
                logger.error(`Failed to add account ${idAccount} to door ${idDoor}: ${error.message}`);
                failedAccounts.push(idAccount);
            }
        }

        if (failedAccounts.length > 0) {
            logger.warn(`Some accounts failed to be added to door ${idDoor}: ${failedAccounts.join(', ')}`);
        } else {
            logger.info(`Add all accounts can access door ${idDoor} successfully`);
        }

        return {success: failedAccounts.length === 0, failedAccounts};
    } catch (error) {
        logger.error(`Error when processing accounts for door ${idDoor}: ${error.message}`);
        return {success: false, failedAccounts: idAccounts};
    }
}

async function removeAccountsAccessDoor(idDoor, idAccounts) {
    const failedAccounts = [];

    try {
        for (const idAccount of idAccounts) {
            try {
                await removeAccountCanAccess(idDoor, idAccount);
            } catch (error) {
                logger.error(`Failed to removed account ${idAccount} to door ${idDoor}: ${error.message}`);
                failedAccounts.push(idAccount);
            }
        }

        if (failedAccounts.length > 0) {
            logger.warn(`Some accounts failed to be removed to door ${idDoor}: ${failedAccounts.join(', ')}`);
        } else {
            logger.info(`Remove all accounts can access door ${idDoor} successfully`);
        }

        return {success: failedAccounts.length === 0, failedAccounts};
    } catch (error) {
        logger.error(`Error when processing accounts for door ${idDoor}: ${error.message}`);
        return {success: false, failedAccounts: idAccounts};
    }
}

async function accessDoor(idDoor, idAccount, token) {
    try {
        const door = await getDoor(idDoor);
        if (!door) {
            logger.warn(`Door ${idDoor} is not exist`, idAccount)
            return [false];
        }

        if (!door.status) {
            logger.info(`Door ${idDoor} is already closed`, idAccount);
            return [false];
        }

        const isAccountCanAccess = await isAccountCanAccessDoor(idDoor, idAccount);
        const tokenValue = await rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`).once("value");
        const isCorrectToken = tokenValue.val().value === token;

        logger.info(`Accept access door ${idDoor} for ${idAccount}`);

        return [isAccountCanAccess && isCorrectToken, door.macAddress];
    } catch (error) {
        logger.error(`Error when accepting access door ${idDoor} for ${idAccount}: ${error.message}`);
        return [false];
    }
}

async function openDoor(idDoor, idAccount) {
    try {
        if (!await isCanCreateDoor(idAccount)) return false;

        const door = await getDoor(idDoor);

        if (!door) {
            logger.warn(`Door ${idDoor} is not exist`, idAccount)
            return false;
        }

        if (!door.status) {
            logger.info(`Door ${idDoor} is closed`, idAccount);
            return false;
        }

        logger.info(`Open door ${idDoor} for ${idAccount}`);
        return [door.macAddress];
    } catch (error) {
        logger.error(`Error when open door ${idDoor} for ${idAccount}: ${error.message}`);
        return false;
    }
}

async function getAccountsCanAccessDoor(idDoor) {
    try {
        const accountsAccessSnapshot = await doorAccessCollection.doc(idDoor).get();
        logger.info(`Get account can access ${idDoor}`);

        const data = accountsAccessSnapshot.data();
        if (!data || !data.idAccountsCanAccess) {
            return [];
        }

        const idAccounts = data.idAccountsCanAccess;
        if (!Array.isArray(idAccounts)) {
            logger.warn(`idAccountsCanAccess for door ${idDoor} is not an array`);
            return [];
        }

        const accountPromises = idAccounts.map(accountId =>
            accountCollection.doc(accountId).get()
        );

        const accountSnapshots = await Promise.all(accountPromises);

        return accountSnapshots
            .filter(snapshot => snapshot.exists)
            .map(snapshot => ({
                ...snapshot.data()
            }));

    } catch (error) {
        logger.error(`Error when get account can access ${idDoor}: ${error.message}`);
        return [];
    }
}

async function addAccountCanAccess(idDoor, idAccount) {
    try {
        await doorAccessCollection.doc(idDoor).update({
            idAccountsCanAccess: FieldValue.arrayUnion(idAccount),
        });
        logger.info(`Add account ${idAccount} can access door ${idDoor}`);
        return true;
    } catch (error) {
        logger.error(`Error when add account ${idAccount} can access door ${idDoor}`);
        return false;
    }
}

async function removeAccountCanAccess(idDoor, idAccount) {
    try {
        const door = await getDoor(idDoor);
        if (door.idAccountCreate === idAccount) {
            logger.warn(`Account ${idAccount} can't be deleted`);
            return false;
        }

        await doorAccessCollection.doc(idDoor).update({
            idAccountsCanAccess: FieldValue.arrayRemove(idAccount),
        });

        logger.info(`Remove account ${idAccount} can access door ${idDoor}`);
        return true;
    } catch (error) {
        logger.error(`Error when remove account ${idAccount} can access door ${idDoor}`);
        return false;
    }
}

async function isAccountCanAccessDoor(idDoor, idAccount) {
    const doorAccessRef = await doorAccessCollection.doc(idDoor).get();
    return doorAccessRef.data().idAccountsCanAccess.includes(idAccount);
}