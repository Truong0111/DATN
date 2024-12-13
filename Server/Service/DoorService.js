const admin = require("firebase-admin");
const constantValue = require("../constants.json");
const {FieldValue} = require('firebase-admin/firestore');
const logService = require("./LogService");

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
            return [false, `You can't register door`];
        }

        const doorExist = await isDoorExist(doorData.position);
        if (doorExist) return [false, `Door at ${doorData.position} is exist.`];

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

        await logService.createLogNormal(
            constantValue.levelLog.LOG_INFO,
            constantValue.services.DoorService,
            `Create new door at position: ${doorData.position}`,
            {
                action: "Create door",
            }
        );

        return [true, `Door at ${doorData.position} create successfully.`, doorRef.id];
    } catch (error) {
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
            return [false, `Door is created by another. You don't have permission to update this door.`];
        }

        const doorExist = await isDoorExist(doorDataUpdate.position);
        if (doorExist) return [false, `Door at ${doorDataUpdate.position} is exist.`];

        const oldPosition = (await doorCollection.doc(idDoor).get()).data().position;

        doorDataUpdate.lastUpdate = new Date().toISOString();
        await doorCollection.doc(idDoor).update(doorDataUpdate);

        await logService.createLogNormal(
            constantValue.levelLog.LOG_INFO,
            constantValue.services.DoorService,
            `Update door position: ${doorDataUpdate.position}`,
            {
                action: "Update door",
            }
        );

        return [true, `Door is changed from ${oldPosition} to ${doorDataUpdate.position}`];

    } catch (error) {
        return [false, `Has error when updating door.`];
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

        const doorRef = await doorCollection.doc(idDoor);

        await logService.createLogNormal(
            constantValue.levelLog.LOG_INFO,
            constantValue.services.DoorService,
            `Delete door position: ${(await doorRef.get()).data().position}`,
            {
                action: "Delete door",
            }
        );

        await doorRef.delete();

        return true;

    } catch (error) {
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
        console.log(`Update mac address for ${idDoor} success`);
        return true
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function updateDoorStatus(idDoor, status) {
    try {
        await doorCollection.doc(idDoor).update({
            status: status === true ? constantValue.doorStatus.open : constantValue.doorStatus.close,
        });
        return true;
    } catch (error) {
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
        if (!door) return [false];
        if (door.status === constantValue.doorStatus.close) return [false];

        const isAccountCanAccess = await isAccountCanAccessDoor(idDoor, idAccount);
        const tokenValue = await rtdb.ref(`${constantValue.tokensCollection}/${idDoor}`).once("value");
        const isCorrectToken = tokenValue.val().value === token;

        await logService.createLogNormal(
            constantValue.levelLog.LOG_INFO,
            constantValue.services.DoorService,
            `Access door ${door.position} by ${idAccount}`,
            {
                action: "Access door",
            }
        );

        return [isAccountCanAccess && isCorrectToken, door.macAddress];
    } catch (error) {
        console.error(error);
        return [false];
    }
}

async function getAccountsCanAccessDoor(idDoor) {
    try {
        const accountsAccessSnapshot = await doorAccessCollection.doc(idDoor).get();
        return accountsAccessSnapshot.data().idAccountsCanAccess;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function addAccountCanAccess(idDoor, idAccount) {
    try {
        await doorAccessCollection.doc(idDoor).update({
            idAccountsCanAccess: FieldValue.arrayUnion(idAccount),
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function removeAccountCanAccess(idDoor, idAccount) {
    try {
        const door = await getDoor(idDoor);
        if (door.idAccountCreate === idAccount) return false;

        await doorAccessCollection.doc(idDoor).update({
            idAccountsCanAccess: FieldValue.arrayRemove(idAccount),
        });

        return true;
    } catch (error) {
        return false;
    }
}

async function isAccountCanAccessDoor(idDoor, idAccount) {
    const doorAccessRef = await doorAccessCollection.doc(idDoor).get();
    return doorAccessRef.data().idAccountsCanAccess.includes(idAccount);
}