const admin = require("firebase-admin");
const constantValue = require("../constants.json");
const logService = require("./LogService");

const fsdb = admin.firestore();

const ticketCollection = fsdb.collection(constantValue.ticketsCollection);
const accountCollection = fsdb.collection(constantValue.accountsCollection);
const doorCollection = fsdb.collection(constantValue.doorsCollection);

module.exports = {
    createTicket,
    updateTicket,
    acceptTicket,
    getTicket,
    getTicketsByIdAccount,
    getTicketsByIdDoor,
    getAllTickets,
    deleteTicket,
    deleteTicketRefIdDoor,
};

async function createTicket(ticketData) {
    try {
        const ticketRef = ticketCollection.doc();
        const idTicket = ticketRef.id;

        if (!isTicketValid(ticketData.startTime, ticketData.endTime)) {
            return false;
        }

        const accountSnapshot = await accountCollection.doc(ticketData.idAccount).get();

        const doorSnapshot = await doorCollection.doc(ticketData.idDoor).get();

        await ticketRef.set({
            fullName: accountSnapshot.data().firstName + " " + accountSnapshot.data().lastName,
            positionDoor: doorSnapshot.data().position,
            idTicket: idTicket,
            idDoor: ticketData.idDoor,
            idAccount: ticketData.idAccount,
            startTime: ticketData.startTime,
            endTime: ticketData.endTime,
            reason: ticketData.reason,
            createdAt: new Date().toISOString(),
            isAccept: false,
        });

        await logService.createLogNormal(
            constantValue.levelLog.LOG_INFO,
            constantValue.services.TicketService,
            `Create ticket by ${ticketData.idAccount} for door ${doorSnapshot.data().position}`,
            {
                action: "Create ticket",
            }
        );

        return true;
    } catch (error) {
        return false;
    }
}

async function acceptTicket(idTicket, idAccountAccept) {
    try {
        await ticketCollection.doc(idTicket).update({
            isAccept: true,
        });

        await logService.createLogNormal(
            constantValue.levelLog.LOG_INFO,
            constantValue.services.TicketService,
            `Accept ticket with id ${idTicket} by ${idAccountAccept}`,
            {
                action: "Accept ticket",
            }
        );

        return true;
    } catch (error) {
        return false;
    }
}

async function rejectTicket(idTicket, idAccountReject) {
    try {
        await ticketCollection.doc(idTicket).update({
            isAccept: false,
        });

        await logService.createLogNormal(
            constantValue.levelLog.LOG_INFO,
            constantValue.services.TicketService,
            `Reject ticket with id ${idTicket} by ${idAccountReject}`,
            {
                action: "Reject ticket",
            }
        );

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
        console.log(ticketSnapshot.exists);
        if (!ticketSnapshot.exists) return []
        return ticketSnapshot.data();
    } catch (error) {
        return null;
    }
}

async function getTicketsByIdAccount(idAccount) {
    try {
        const ticketsSnapshot = await ticketCollection
            .where("idAccount", "==", idAccount)
            .get();
        return ticketsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        return [];
    }
}

async function getTicketsByIdDoor(idDoor) {
    try {
        const ticketsSnapshot = await ticketCollection
            .where("idDoor", "==", idDoor)
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

async function deleteTicket(idTicket) {
    try {
        await ticketCollection.doc(idTicket).delete();

        await logService.createLogNormal(
            constantValue.levelLog.LOG_INFO,
            constantValue.services.TicketService,
            `Delete ticket with id ${idTicket}`,
            {
                action: "Delete ticket",
            }
        );

        return true;
    } catch (error) {
        return false;
    }
}

async function deleteTicketRefIdAccount(idAccount) {
    try {
        const ticketsSnapshot = await ticketCollection
            .where("idAccount", "==", idAccount)
            .get();

        ticketsSnapshot.forEach((docRef) => {
            deleteTicket(docRef.id);
        })

        return true;
    } catch (error) {
        return false;
    }
}

async function deleteTicketRefIdDoor(idDoor) {
    try {
        const ticketsSnapshot = await ticketCollection
            .where("idDoor", "==", idDoor)
            .get();

        ticketsSnapshot.forEach((docRef) => {
            deleteTicket(docRef.id);
        })

        return true;
    } catch (error) {
        return false;
    }
}

function isTicketValid(startTime, endTime) {
    const timeStart = new Date(startTime);
    const timeEnd = new Date(endTime);
    return timeStart <= timeEnd;
}
