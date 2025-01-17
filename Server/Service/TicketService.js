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
    addAccountsAccessDoor,
    removeAccountsAccessDoor
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
            createBy: "user"
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
        if (util.isArrayEmptyOrNull(ticketsSnapshot)) {
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

        if (util.isArrayEmptyOrNull(ticketsSnapshot)) {
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

        if (util.isArrayEmptyOrNull(ticketsSnapshot)) {
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

async function addAccountsAccessDoor(idDoor, idAccounts) {
    const failedAccounts = [];

    try {
        for (const idAccount of idAccounts) {
            const failedAccount = await createAcceptTicket(idDoor, idAccount);
            if (!failedAccount.success) failedAccounts.push(idAccount);
        }
        if (failedAccounts.length > 0) {
            logger.warn(`Failed to add accepted tickets for accounts ${failedAccounts.join(", ")}`);
            return {success: true, failedAccounts: failedAccounts}
        } else if (failedAccounts.length === idAccounts.length) {
            logger.warn(`Failed to add accepted tickets for all accounts can access door ${idDoor}`);
            return {success: false, failedAccounts: failedAccounts}
        } else {
            logger.info(`Added accepted tickets for all accounts can access door ${idDoor}`);
            return {success: true, failedAccounts: failedAccounts}
        }
    } catch (error) {
        logger.error(`Error when add accounts can access door ${idDoor}`);
        return {success: false, failedAccounts: failedAccounts};
    }
}

async function removeAccountsAccessDoor(idDoor, idAccounts) {
    const failedAccounts = [];

    try {
        for (const idAccount of idAccounts) {
            const failedAccount = await removeAcceptTicket(idDoor, idAccount);
            if (!failedAccount.success) failedAccounts.push(idAccount);
        }

        if (failedAccounts.length > 0) {
            logger.warn(`Failed to remove accepted tickets for accounts ${failedAccounts.join(", ")}`);
            return {success: true, failedAccounts: failedAccounts}
        } else if (failedAccounts.length === idAccounts.length) {
            logger.warn(`Failed to remove accepted tickets for all accounts can access door ${idDoor}`);
            return {success: false, failedAccounts: failedAccounts}
        } else {
            logger.info(`Removed accepted tickets for all accounts can access door ${idDoor}`);
            return {success: true, failedAccounts: failedAccounts}
        }

    } catch (error) {
        logger.error(`Error when remove accounts can access door ${idDoor}`);
        return {success: false, failedAccounts: failedAccounts};
    }
}

function isTicketValid(startTime, endTime) {
    const timeStart = new Date(startTime);
    const timeEnd = new Date(endTime);
    return timeStart <= timeEnd;
}

async function createAcceptTicket(idDoor, idAccount) {
    try {
        const ticketRef = ticketCollection.doc();
        const idTicket = ticketRef.id;

        const currentDate = new Date();
        const endTime = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        const accountSnapshot = await accountCollection.doc(idAccount).get();

        const doorSnapshot = await doorCollection.doc(idDoor).get();

        await ticketRef.set({
            fullName: accountSnapshot.data().firstName + " " + accountSnapshot.data().lastName,
            positionDoor: doorSnapshot.data().position,
            idTicket: idTicket,
            idDoor: idDoor,
            idAccount: idAccount,
            startTime: currentDate.toISOString(),
            endTime: endTime.toISOString(),
            reason: `Access door by manager`,
            createdAt: currentDate.toISOString(),
            isAccept: true,
            createBy: "manager"
        });
        logger.info(`Add account ${idAccount} can access door ${idDoor}`);
        return {success: true};
    } catch (error) {
        logger.error(`Failed to add accepted ticket for account ${idAccount}`);
        console.error(error);
        return {success: false, error: error};
    }
}

async function removeAcceptTicket(idDoor, idAccount) {
    try {
        const ticketRef = await ticketCollection
            .where("idAccount", "==", idAccount)
            .where("idDoor", "==", idDoor)
            // .where("createBy", "array-contains-any", constantValue.roleToCheck)
            .get();

        if (ticketRef.empty) {
            logger.warn(`No accepted ticket for account ${idAccount} and door ${idDoor}`);
            return false;
        }

        const deletePromises = ticketRef.docs.map((doc) => doc.ref.delete());
        await Promise.all(deletePromises);

        logger.info(`Removed accepted ticket for account ${idAccount} and door ${idDoor}`);
        return {success: true};
    } catch (error) {
        logger.error(`Failed to remove accepted ticket for account ${idAccount}: ${error.message}`);
        console.error(error);
        return {success: false, error: error};
    }
}
