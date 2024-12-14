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
    updateDoorStatus,

    accessDoor,
    addAccountCanAccess,
    removeAccountCanAccess,
    isAccountCanAccessDoor,
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
            logger.info(`Door ${doorData.position} already exists`);
            return [false, `Door at ${doorData.position} is exist.`];
        }

        const doorRef = doorCollection.doc();
        await doorRef.set({
            idDoor: doorRef.id,
            idAccountCreate: doorData.idAccountCreate,
            macAddress: doorData.macAddress,
            position: doorData.position,
            status: constantValue.doorStatus.open,
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
        if (doorExist) return [false, `Door at ${doorDataUpdate.position} is exist.`];

        const oldPosition = (await doorCollection.doc(idDoor).get()).data().position;

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
        logger.info(`Get data door ${idDoor}`);
        return doorSnapshot.data();
    } catch (error) {
        logger.error(`Error when getting door ${idDoor}: ${error.message}`);
        return null;
    }
}

async function getAllDoors() {
    try {
        const doorsSnapshot = await doorCollection.get();
        logger.info(`Get all data doors`);
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
            status: status === true ? constantValue.doorStatus.open : constantValue.doorStatus.close,
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

// Door Access Functions
async function accessDoor(idDoor, idAccount, token) {
    try {
        const door = await getDoor(idDoor);
        if (!door) {
            logger.warn(`Door ${idDoor} is not exist`, idAccount)
            return [false];
        }

        if (door.status === constantValue.doorStatus.close) {
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

async function getAccountsCanAccessDoor(idDoor) {
    try {
        const accountsAccessSnapshot = await doorAccessCollection.doc(idDoor).get();
        logger.info(`Get account can access ${idDoor}`);
        return accountsAccessSnapshot.data().idAccountsCanAccess;
    } catch (error) {
        logger.error(`Error when get account can access ${idDoor}`);
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