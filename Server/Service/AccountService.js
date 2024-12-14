const admin = require("firebase-admin");
const util = require("../utils");
const constantValue = require("../constants.json");
const logger = require("../winston");

const fsdb = admin.firestore();

const accountCollection = fsdb.collection(constantValue.accountsCollection);

module.exports = {
    registerAccount,
    loginAccount,
    updateAccount,
    deleteAccount,
    getAccount,
    getAllAccounts,
}


async function registerAccount(accountData) {
    try {
        if (await isEmailExist(accountData.email)) {
            logger.info(`Register failed: Email already exists ${accountData.email}`);
            return [false, "Email already exists"];
        }
        if (await isRefIdExist(accountData.refId)) {
            logger.info(`Register failed: Ref Id already exists ${accountData.refId}`);
            return [false, "ID already exists"];
        }
        if (await isPhoneNumberExist(accountData.phoneNumber)) {
            logger.info(`Register failed: Phone number already exists ${accountData.phoneNumber}`);
            return [false, "Phone number already exists"];
        }

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
            role: ["user"],
        });

        logger.info(`Register new account: ${accountRef.id}`)
        return [true, "Register account successfully"];
    } catch (error) {
        logger.error(`Error registering account: ${error.message}`)
        return [false, "Server error!"];
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
            logger.info(`Login request: ${userSnapshot.docs[0].id}`);
            return userSnapshot.docs[0].data();
        } else {
            logger.info(`Login request failed username: ${username}`);
            return false;
        }
    } catch (error) {
        logger.error(`Error login request: ${error.message}`);
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

        logger.info(`Update account: ${idAccount}`)

        return true;
    } catch (error) {

        logger.error(`Error updating account: ${error.message}`)
        return false;
    }
}

async function getAccount(idAccount) {
    try {
        const accountSnapshot = await accountCollection.doc(idAccount).get();

        logger.info(`Get account: ${idAccount}`);
        return accountSnapshot.data();
    } catch (error) {
        logger.error(`Error getting account: ${error}`);
        return null;
    }
}

async function getAllAccounts() {
    try {
        const accountsSnapshot = await accountCollection.get();
        logger.info(`Get all accounts`);
        return accountsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        logger.error(`Error getting all accounts: ${error}`);
        return [];
    }
}

async function deleteAccount(idAccountDelete) {
    try {
        await accountCollection.doc(idAccountDelete).delete();
        logger.info(`Delete account: ${idAccountDelete}`);
        return true;
    } catch (error) {
        logger.error(`Error deleting account: ${error}`);
        return false;
    }
}

async function isEmailExist(email) {
    const userSnapshot = await accountCollection
        .where("email", "==", email)
        .get();

    return !userSnapshot.empty;
}

async function isRefIdExist(refId) {
    const userSnapshot = await accountCollection
        .where("refId", "==", refId)
        .get();

    return !userSnapshot.empty;
}

async function isPhoneNumberExist(phoneNumber) {
    const userSnapshot = await accountCollection
        .where("phoneNumber", "==", phoneNumber)
        .get();

    return !userSnapshot.empty;
}