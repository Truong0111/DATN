const admin = require("firebase-admin");
const constantValue = require("../constants.json");
const util = require("../utils");

const fsdb = admin.firestore();
const rtdb = admin.database();

const logCollection = fsdb.collection(constantValue.logsCollection);

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
