const admin = require("firebase-admin");
const constantValue = require("../constants.json");

const fsdb = admin.firestore();

const ticketCollection = fsdb.collection(constantValue.ticketsCollection);

module.exports = {
    createTicket,
    updateTicket,
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
    const timeStart = new Date(startTime).getTime();
    const timeEnd = new Date(endTime).getTime();
    return timeStart <= timeEnd;
}
