const admin = require("firebase-admin");
const constantValue = require("../constants.json");
const util = require("../utils");

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
            arrDoor: [],
            role: ["user"],
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function registerAccountManager(accountData) {
    try {
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
            arrDoor: [],
            role: ["user", "manager"],
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function registerAccountAdmin(accountData) {
    try {
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
            arrDoor: [],
            role: ["user", "manager", "admin"],
        });
        return true;
    } catch (error) {
        return false;
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
            return userSnapshot.docs[0].data();
        } else {
            return false;
        }
    } catch (error) {
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
        return true;
    } catch (error) {
        return false;
    }
}

async function getAccount(idAccount) {
    try {
        const accountSnapshot = await accountCollection.doc(idAccount).get();
        return accountSnapshot.data();
    } catch (error) {
        return null;
    }
}

async function getAllAccounts() {
    try {
        const accountsSnapshot = await accountCollection.get();
        return accountsSnapshot.docs.map((doc) => doc.data());
    } catch (error) {
        return [];
    }
}

async function deleteAccount(idAccountDelete) {
    try {
        await accountCollection.doc(idAccountDelete).delete();
        return true;
    } catch (error) {
        return false;
    }
}