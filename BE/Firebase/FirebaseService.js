const admin = require("firebase-admin");
const serviceAccount = require("../../key/serviceAccountKey.json");
const googleService = require("../../key/google-services.json");

const constantValue = require("../constants.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: googleService.project_info.firebase_url,
});

const fsdb = admin.firestore();

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
    const accountRef = fsdb.collection(constantValue.usersCollection).doc();
    const idAccount = accountRef.id;

    await accountRef.set({
      idAccount: idAccount,
      firstName: accountData.firstName,
      lastName: accountData.lastName,
      refId: accountData.refId,
      email: accountData.email,
      phoneNumber: accountData.phoneNumber,
      password: accountData.password,
      arrDoor: [],
      role: ["user"],
    });

    console.log(`User ${accountData.email} added successfully.`);
  } catch (error) {
    console.error("Error register: ", error);
  }
}

async function loginAccount(username, password) {
  try {
    let userSnapshot = await fsdb
      .collection(constantValue.usersCollection)
      .where("email", "==", username)
      .where("password", "==", password)
      .get();

    if (userSnapshot.empty) {
      userSnapshot = await fsdb
        .collection(constantValue.usersCollection)
        .where("phoneNumber", "==", username)
        .where("password", "==", password)
        .get();
    }

    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      console.log(
        `Login successful for user: ${userData.email || userData.phoneNumber}`
      );
      return true;
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

    await fsdb
      .collection(constantValue.accountsCollection)
      .doc(idAccount)
      .update(dataToUpdate);

    console.log(`Account with ID ${idAccount} updated successfully.`);
  } catch (error) {
    console.error("Error updating account: ", error);
  }
}

async function deleteAccount(idAccountDelete, idAccountDeleteBy) {
  try {
    await fsdb
      .collection(constantValue.accountsCollection)
      .doc(idAccountDelete)
      .delete();
    console.log(`Account with ID ${idAccountDelete} deleted  by ${idAccountDeleteBy} successfully.`);
  } catch (error) {
    console.error("Error deleting account: ", error);
  }
}

async function getAccount(idAccount) {
  try {
    const accountSnapshot = await fsdb
      .collection(constantValue.accountsCollection)
      .doc(idAccount)
      .get();
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

async function createDoor(idAccountCreate, doorData) {
  try {
    const doorRef = fsdb.collection(constantValue.doorsCollection).doc();
    const idDoor = doorRef.id;

    await doorRef.set({
      idDoor: idDoor,
      idAccountCreate: idAccountCreate,
      position: doorData.position,
    });

    console.log(
      `Door ${doorData.position} by ${idAccountCreate} added successfully.`
    );
  } catch (error) {
    console.error("Error create door: ", error);
  }
}

async function updateDoor(idAccountCreate, idDoor, doorDataUpdate) {
  try {
    const dataToUpdate = { ...doorDataUpdate };

    delete dataToUpdate.idDoor;
    delete dataToUpdate.idAccountCreate;

    await fsdb
      .collection(constantValue.doorsCollection)
      .doc(idDoor)
      .where("idAccountCreate", "==", idAccountCreate)
      .update(doorDataUpdate);
  } catch (error) {
    console.error("Error update door: ", error);
  }
}

async function getDoor(idDoor) {
  try {
    const doorSnapshot = await fsdb
      .collection(constantValue.doorsCollection)
      .doc(idDoor)
      .get();
    return doorSnapshot.data();
  } catch (error) {
    console.error("Error get door: ", error);
  }
}

async function deleteDoor(idDoor) {
  try {
    await fsdb.collection(constantValue.doorsCollection).doc(idDoor).delete();
    console.log(`Door with ID ${idDoor} deleted successfully.`);
  } catch (error) {
    console.error("Error delete door: ", error);
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
    const ticketRef = fsdb.collection(constantValue.ticketsCollection).doc();
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
  }
}

async function updateTicket(idTicket, ticketDataUpdate) {
  try {
    const dataToUpdate = { ...ticketDataUpdate };

    delete dataToUpdate.idTicket;
    delete dataToUpdate.idDoor;
    delete dataToUpdate.idAccount;

    await fsdb
      .collection(constantValue.ticketsCollection)
      .doc(idTicket)
      .update(dataToUpdate);
  } catch (error) {
    console.error("Error update ticket: ", error);
  }
}

async function getTicket(idTicket) {
  try {
    const ticketSnapshot = await fsdb
      .collection(constantValue.ticketsCollection)
      .doc(idTicket)
      .get();
    return ticketSnapshot.data();
  } catch (error) {
    console.error("Error get ticket: ", error);
  }
}

async function deleteTicket(idTicket) {
  try {
    await fsdb
      .collection(constantValue.ticketsCollection)
      .doc(idTicket)
      .delete();
    console.log(`Ticket with ID ${idTicket} deleted successfully.`);
  } catch (error) {
    console.error("Error delete ticket: ", error);
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
    const logRef = fsdb.collection(constantValue.entryLogsCollection).doc();
    const idLog = entryLogRef.id;

    await logRef.set({
      idLog: idLog,
      type: logData.type,
      info: logData.info,
    });
  } catch (error) {
    console.error("Error create entry log: ", error);
  }
}

async function getLog(idLog) {
  try {
    const logSnapshot = await fsdb.collection(constantValue.entryLogsCollection).doc(idLog).get();
    return logSnapshot.data();
  } catch (error) {
    console.error("Error get entry log: ", error);
  }
}

async function deleteLog(idLog) {
  try {
    await fsdb.collection(constantValue.entryLogsCollection).doc(idLog).delete();
    console.log(`Entry log with ID ${idLog} deleted successfully.`);
  } catch (error) {
    console.error("Error delete entry log: ", error);
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
    const tokenRef = fsdb.collection(constantValue.tokensCollection).doc();
    const idToken = tokenRef.id;

    await tokenRef.set({
      idToken: idToken,
      key: `${tokenData.idDoor}-${tokenData.idAccount}`,
      value: tokenData.expiredTime,
    });
  } catch (error) {
    console.error("Error create token: ", error);
  }
}

async function getToken(idToken) {
  try {
    const tokenSnapshot = await fsdb.collection(constantValue.tokensCollection).doc(idToken).get();
    return tokenSnapshot.data();
  } catch (error) {
    console.error("Error get token: ", error);
  }
}

async function updateToken(idToken, tokenDataUpdate) {
  try {
    const dataToUpdate = { ...tokenDataUpdate };

    delete dataToUpdate.idToken;
    delete dataToUpdate.key;

    await fsdb
      .collection(constantValue.tokensCollection)
      .doc(idToken)
      .update(dataToUpdate);
  } catch (error) {
    console.error("Error update token: ", error);
  }
}

async function deleteToken(idToken) {
  try {
    await fsdb.collection(constantValue.tokensCollection).doc(idToken).delete();
    console.log(`Token with ID ${idToken} deleted successfully.`);
  } catch (error) {
    console.error("Error delete token: ", error);
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
