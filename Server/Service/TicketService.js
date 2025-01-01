const admin = require("firebase-admin");
const constantValue = require("../constants.json");
const util = require("../utils");
const logger = require("../winston");

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
    deleteTicketRefIdAccount,
    deleteTicketRefIdDoor,
};

async function createTicket(ticketData) {
    try {
        const ticketRef = ticketCollection.doc();
        const idTicket = ticketRef.id;

        if (!isTicketValid(ticketData.startTime, ticketData.endTime)) {
            logger.warn(`Invalid start time and end time`, {startTime: ticketData.startTime, endTime: ticketData.end});
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

        logger.info(`Create new ticket ${idTicket} by account ${ticketData.idAccount}`);
        return true;
    } catch (error) {
        logger.error(`Error create new ticket from account ${ticketData.idAccount}`, error);
        return false;
    }
}

async function acceptTicket(idTicket, idAccountAccept) {
    try {
        await ticketCollection.doc(idTicket).update({
            isAccept: true,
        });
        logger.info(`Accepted ticket ${idTicket} from ${idAccountAccept}`)
        return true;
    } catch (error) {
        logger.error(`Error accept ticket ${idTicket} from ${idAccountAccept}`, error);
        return false;
    }
}

async function rejectTicket(idTicket, idAccountReject) {
    try {
        await ticketCollection.doc(idTicket).update({
            isAccept: false,
        });
        logger.info(`Rejected ticket ${idTicket} from ${idAccountReject}`)
        return true;
    } catch (error) {
        logger.error(`Error reject ticket ${idTicket} from ${idAccountReject}`, error);
        return false;
    }
}

async function updateTicket(idTicket, ticketDataUpdate) {
    try {
        const ticketData = await getTicket(idTicket);

        if (!isTicketValid(ticketData.startTime, ticketData.endTime)) {
            logger.warn(`Invalid start time and end time`, {startTime: ticketData.startTime, endTime: ticketData.end});
            return false;
        }

        const dataToUpdate = {...ticketDataUpdate};

        delete dataToUpdate.idTicket;
        delete dataToUpdate.idDoor;
        delete dataToUpdate.idAccount;

        await ticketCollection.doc(idTicket).update(dataToUpdate);

        logger.info(`Updated ticket ${idTicket}`);

        return true;
    } catch (error) {
        logger.error(`Error update ticket ${idTicket}`, error);
        return false;
    }
}

async function getTicket(idTicket) {
    try {
        const ticketSnapshot = await ticketCollection.doc(idTicket).get();
        if (!ticketSnapshot.exists) {
            logger.warn(`Ticket ${idTicket} does not exist`);
            return []
        }

        return ticketSnapshot.data();
    } catch (error) {
        logger.error(`Error get ticket ${idTicket}`, error);
        return null;
    }
}

async function getTicketsByIdAccount(idAccount) {
    try {
        const ticketsSnapshot = await ticketCollection
            .where("idAccount", "==", idAccount)
            .get();
        if (util.isArrayEmptyOrNull(ticketsSnapshot)) {
            logger.warn(`Account ${idAccount} does not have any tickets`);
            return []
        }

        return ticketsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        logger.error(`Error when getting tickets from account ${idAccount}`)

        return [];
    }
}

async function getTicketsByIdDoor(idDoor) {
    try {
        const ticketsSnapshot = await ticketCollection
            .where("idDoor", "==", idDoor)
            .get();

        if (util.isArrayEmptyOrNull(ticketsSnapshot)) {
            logger.warn(`Door ${idDoor} does not have refs any tickets`);
            return []
        }

        return ticketsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        logger.error(`Error when getting tickets ref door ${idDoor}`)

        return [];
    }
}

async function getAllTickets() {
    try {
        const ticketsSnapshot = await ticketCollection.get();
        if(util.isArrayEmptyOrNull(ticketsSnapshot)){
            return [];
        }

        return ticketsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        logger.error(`Error when getting all tickets`);
        return [];
    }
}

async function deleteTicket(idTicket) {
    try {
        await ticketCollection.doc(idTicket).delete();
        logger.info(`Deleted ticket ${idTicket}`);
        return true;
    } catch (error) {
        logger.error(`Error when deleting ticket ${idTicket}`);
        return false;
    }
}

async function deleteTicketRefIdAccount(idAccount) {
    try {
        const ticketsSnapshot = await ticketCollection
            .where("idAccount", "==", idAccount)
            .get();

        if(util.isArrayEmptyOrNull(ticketsSnapshot)){
            return false;
        }

        ticketsSnapshot.forEach((docRef) => {
            deleteTicket(docRef.id);
        })
        return true;
    } catch (error) {
        logger.error(`Error when deleting ticket ref account ${idAccount}`);
        return false;
    }
}

async function deleteTicketRefIdDoor(idDoor) {
    try {
        const ticketsSnapshot = await ticketCollection
            .where("idDoor", "==", idDoor)
            .get();

        if(util.isArrayEmptyOrNull(ticketsSnapshot)){
            logger.warn(`No ticket ref door ${idDoor}`);
            return false;
        }

        ticketsSnapshot.forEach((docRef) => {
            deleteTicket(docRef.id);
        })


        logger.info(`Delete all tickets ref door ${idDoor}`);

        return true;
    } catch (error) {
        logger.error(`Error deleting tickets ref door ${idDoor}`);

        return false;
    }
}

function isTicketValid(startTime, endTime) {
    const timeStart = new Date(startTime);
    const timeEnd = new Date(endTime);
    return timeStart <= timeEnd;
}
