const admin = require("firebase-admin");

const serviceAccount = require("../../key/serviceAccountKey.json");
const googleService = require("../../key/google-services.json");
const constantValue = require("../constants.json");
const util = require("../../util");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: googleService.project_info.firebase_url,
});

const fsdb = admin.firestore();

const accountCollection = fsdb.collection(constantValue.accountsCollection);
const doorCollection = fsdb.collection(constantValue.doorsCollection);
const ticketCollection = fsdb.collection(constantValue.ticketsCollection);
const tokenCollection = fsdb.collection(constantValue.tokensCollection);
const logCollection = fsdb.collection(constantValue.logsCollection);
const entryLogCollection = fsdb.collection(constantValue.entryLogsCollection);

// ------------ Account ------------

const accountService = {
  registerAccount,
  loginAccount,
  updateAccount,
  deleteAccount,
  getAccount,
};

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

    console.log(`User ${accountData.email} added successfully.`);
    return true;
  } catch (error) {
    console.error("Error register: ", error);
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
      const userData = userSnapshot.docs[0].data();
      console.log(
        `Login successful for user: ${userData.email || userData.phoneNumber}`
      );
      return userSnapshot.docs[0].id;
    } else {
      console.log("Login failed: Invalid username or password.");
      return false;
    }
  } catch (error) {
    console.error("Error login: ", error);
    return false;
  }
}

async function updateAccount(idAccount, accountDataUpdate) {
  try {
    const dataToUpdate = { ...accountDataUpdate };

    delete dataToUpdate.idAccount;

    await accountCollection.doc(idAccount).update(dataToUpdate);

    console.log(`Account with ID ${idAccount} updated successfully.`);
    return true;
  } catch (error) {
    console.error("Error updating account: ", error);
    return false;
  }
}

async function deleteAccount(idAccountDelete) {
  try {
    await accountCollection.doc(idAccountDelete).delete();
    console.log(
      `Account with ID ${idAccountDelete} is  deleted  successfully.`
    );
    return true;
  } catch (error) {
    console.error("Error deleting account: ", error);
    return false;
  }
}

async function getAccount(idAccount) {
  try {
    const accountSnapshot = await accountCollection.doc(idAccount).get();
    return accountSnapshot.data();
  } catch (error) {
    console.error("Error getting account: ", error);
    return null;
  }
}

// ------------------------------

// ------------ Door ------------

const doorService = {
  createDoor,
  updateDoor,
  getDoor,
  deleteDoor,
};

async function createDoor(doorData) {
  try {
    const rolesToCheck = ["manager", "admin"];
    const accountSnapshot = await accountCollection
      .where("idAccount", "==", doorData.idAccountCreate)
      .where("role", "array-contains-any", rolesToCheck)
      .get();

    if (accountSnapshot.empty) {
      console.log("Can't create door: Account is not a manager or admin.");
      return false;
    }

    const doorRef = doorCollection.doc();

    await doorRef.set({
      idDoor: doorRef.id,
      idAccountCreate: doorData.idAccountCreate,
      position: doorData.position,
    });

    console.log(
      `Door ${doorData.position} by ${doorData.idAccountCreate} added successfully.`
    );
    return true;
  } catch (error) {
    console.error("Error create door: ", error);
    return false;
  }
}

async function updateDoor(idDoor, doorDataUpdate) {
  try {
    const idAccountCreate = doorDataUpdate.idAccountCreate;
    console.log(idAccountCreate);
    console.log(doorDataUpdate.idDoor);
    console.log(doorDataUpdate.position);
    const doorSnapShot = await doorCollection
      .where("idAccountCreate", "==", idAccountCreate)
      .get();

    if (doorSnapShot.empty) {
      console.log(
        `Can't update door: Account ${idAccountCreate} not create this door.`
      );
      return false;
    }

    await doorCollection.doc(idDoor).update(doorDataUpdate);
    console.log(`Door with ID ${idDoor} updated successfully.`);
    return true;
  } catch (error) {
    console.error("Error update door: ", error);
    return false;
  }
}

async function getDoor(idDoor) {
  try {
    const doorSnapshot = await doorCollection.doc(idDoor).get();
    return doorSnapshot.data();
  } catch (error) {
    console.error("Error get door: ", error);
    return null;
  }
}

async function deleteDoor(idDoor) {
  try {
    await doorCollection.doc(idDoor).delete();
    console.log(`Door with ID ${idDoor} deleted successfully.`);
    return true;
  } catch (error) {
    console.error("Error delete door: ", error);
    return false;
  }
}

// ------------------------------

// ------------ Ticket ------------

const ticketService = {
  createTicket,
  updateTicket,
  getTicket,
  deleteTicket,
};

async function createTicket(ticketData) {
  try {
    const ticketRef = ticketCollection.doc();
    const idTicket = ticketRef.id;

    await ticketRef.set({
      idTicket: idTicket,
      idDoor: ticketData.idDoor,
      idAccount: ticketData.idAccount,
      startTime: ticketData.startTime,
      endTime: ticketData.endTime,
      isAccept: false,
    });

    console.log(`Ticket ${idTicket} added successfully.`);
  } catch (error) {
    console.error("Error create ticket: ", error);
    return false;
  }
}

async function updateTicket(idTicket, ticketDataUpdate) {
  try {
    const dataToUpdate = { ...ticketDataUpdate };

    delete dataToUpdate.idTicket;
    delete dataToUpdate.idDoor;
    delete dataToUpdate.idAccount;

    await ticketCollection.doc(idTicket).update(dataToUpdate);
  } catch (error) {
    console.error("Error update ticket: ", error);
    return false;
  }
}

async function getTicket(idTicket) {
  try {
    const ticketSnapshot = await ticketCollection.doc(idTicket).get();
    return ticketSnapshot.data();
  } catch (error) {
    console.error("Error get ticket: ", error);
    return null;
  }
}

async function deleteTicket(idTicket) {
  try {
    await ticketCollection.doc(idTicket).delete();
    console.log(`Ticket with ID ${idTicket} deleted successfully.`);
  } catch (error) {
    console.error("Error delete ticket: ", error);
    return false;
  }
}

// ------------------------------

// ------------ Log ------------

const logService = {
  createLog,
  getLog,
  deleteLog,
};

async function createLog(logData) {
  try {
    const logRef = entryLogCollection.doc();
    const idLog = logRef.id;

    await logRef.set({
      idLog: idLog,
      type: logData.type,
      info: logData.info,
    });
  } catch (error) {
    console.error("Error create entry log: ", error);
    return false;
  }
}

async function getLog(idLog) {
  try {
    const logSnapshot = await entryLogCollection.doc(idLog).get();
    return logSnapshot.data();
  } catch (error) {
    console.error("Error get entry log: ", error);
    return null;
  }
}

async function deleteLog(idLog) {
  try {
    await entryLogCollection.doc(idLog).delete();
    console.log(`Entry log with ID ${idLog} deleted successfully.`);
  } catch (error) {
    console.error("Error delete entry log: ", error);
    return false;
  }
}

// ------------------------------

// ------------ Token ------------

const tokenService = {
  createToken,
  getToken,
  updateToken,
  deleteToken,
};

async function createToken(tokenData) {
  try {
    const tokenRef = tokenCollection.doc();
    const idToken = tokenRef.id;

    await tokenRef.set({
      idToken: idToken,
      key: `${tokenData.idDoor}-${tokenData.idAccount}`,
      value: tokenData.expiredTime,
    });
  } catch (error) {
    console.error("Error create token: ", error);
    return false;
  }
}

async function getToken(idToken) {
  try {
    const tokenSnapshot = await tokenCollection.doc(idToken).get();
    return tokenSnapshot.data();
  } catch (error) {
    console.error("Error get token: ", error);
    return null;
  }
}

async function updateToken(idToken, tokenDataUpdate) {
  try {
    const dataToUpdate = { ...tokenDataUpdate };

    delete dataToUpdate.idToken;
    delete dataToUpdate.key;

    await tokenCollection.doc(idToken).update(dataToUpdate);
  } catch (error) {
    console.error("Error update token: ", error);
    return false;
  }
}

async function deleteToken(idToken) {
  try {
    await tokenCollection.doc(idToken).delete();
    console.log(`Token with ID ${idToken} deleted successfully.`);
  } catch (error) {
    console.error("Error delete token: ", error);
    return false;
  }
}

// ------------------------------

module.exports = {
  accountService,
  doorService,
  ticketService,
  tokenService,
  logService,
};
