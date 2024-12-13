const admin = require("firebase-admin");
const constantValue = require("../constants.json");
const util = require("../utils");

const fsdb = admin.firestore();
const rtdb = admin.database();

const logCollection = fsdb.collection(constantValue.logsCollection);

module.exports = {
    createLogNormal,
    createLog,
    getLog,
    deleteLog,
};

async function createLogNormal(level, service, message, context) {
    try {
        const logRef = logCollection.doc();
        const idLog = logRef.id;

        await logRef.set({
            idLog: idLog,
            timestamp: new Date().toISOString(),
            level: level,
            service: service,
            message: message,
            context: context
        });

        return true;
    } catch (error) {
        return false;
    }
}

async function createLog(logData) {
    try {
        const logRef = logCollection.doc();
        const idLog = logRef.id;

        await logRef.set({
            idLog: idLog, //Server write
            timestamp: new Date().toISOString(), //Server write
            level: logData.level, //Write in log data
            service: logData.service, //Write in log data
            message: logData.message, //Write in log data
            context: logData.context //Write in log data
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

async function getAllLogs(idLog) {
    try {
        const logSnapshot = await logCollection.get();
        return logSnapshot.docs.map((doc) => doc.data());
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
