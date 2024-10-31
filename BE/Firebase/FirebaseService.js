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
const rtdb = admin.database();

const accountCollection = fsdb.collection(constantValue.accountsCollection);
const doorCollection = fsdb.collection(constantValue.doorsCollection);
const ticketCollection = fsdb.collection(constantValue.ticketsCollection);
// const tokenCollection = fsdb.collection(constantValue.tokensCollection);
const logCollection = fsdb.collection(constantValue.logsCollection);
const entryLogCollection = fsdb.collection(constantValue.entryLogsCollection);

// const tokenRef = rtdb.ref(constantValue.tokensCollection);

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

    dataToUpdate.password = await util.hashPassword(dataToUpdate.password);

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
const rolesToCheck = ["manager", "admin"];

async function createDoor(doorData) {
  try {
    const idAccount = doorData.idAccountCreate;
    const isAccountCanCreateDoor = await isCanCreateDoor(idAccount);
    if (!isAccountCanCreateDoor) {
      return false;
    }

    const doorRef = doorCollection.doc();
    await doorRef.set({
      idDoor: doorRef.id,
      idAccountCreate: doorData.idAccountCreate,
      position: doorData.position,
    });

    console.log(
      `Door at ${doorData.position} by ${doorData.idAccountCreate} added successfully.`
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

    const isAccountCanUpdateDoor = await isCanUpdateOrDeleteDoor(
      idAccountCreate,
      idDoor
    );

    if (!isAccountCanUpdateDoor) {
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

async function deleteDoor(idAccountDelete, idDoor) {
  try {
    const isAccountCanDeleteDoor = await isCanUpdateOrDeleteDoor(
      idAccountDelete,
      idDoor
    );
    if (!isAccountCanDeleteDoor) {
      return false;
    }

    await doorCollection.doc(idDoor).delete();
    console.log(`Door with ID ${idDoor} deleted successfully.`);
    return true;
  } catch (error) {
    console.error("Error delete door: ", error);
    return false;
  }
}

async function isCanCreateDoor(idAccount) {
  const accountSnapshot = await accountCollection
    .where("idAccount", "==", idAccount)
    .where("role", "array-contains-any", rolesToCheck)
    .get();
  if (accountSnapshot.empty) {
    console.log("Can't create door: Account is not a manager or admin.");
    return false;
  }
  return true;
}

async function isCanUpdateOrDeleteDoor(idAccount, idDoor) {
  const doorSnapShot = await doorCollection
    .where("idDoor", "==", idDoor)
    .where("idAccountCreate", "==", idAccount)
    .get();
  if (doorSnapShot.empty) {
    console.log(
      `Can't update or delete door: Account ${idAccount} not create this door.`
    );
    return false;
  }
  return true;
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

    if (!isTicketValid(ticketData.startTime, ticketData.endTime)) {
      console.log(`End time is before start time.`);
      return false;
    }

    await ticketRef.set({
      idTicket: idTicket,
      idDoor: ticketData.idDoor,
      idAccount: ticketData.idAccount,
      startTime: ticketData.startTime,
      endTime: ticketData.endTime,
      isAccept: false,
    });
    console.log(`Ticket ${idTicket} added successfully.`);
    return true;
  } catch (error) {
    console.error("Error create ticket: ", error);
    return false;
  }
}

async function updateTicket(idTicket, ticketDataUpdate) {
  try {
    if (!isTicketValid(ticketDataUpdate.startTime, ticketDataUpdate.endTime)) {
      console.log(`End time is before start time.`);
      return false;
    }

    const dataToUpdate = { ...ticketDataUpdate };

    delete dataToUpdate.idTicket;
    delete dataToUpdate.idDoor;
    delete dataToUpdate.idAccount;

    await ticketCollection.doc(idTicket).update(dataToUpdate);
    return true;
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
    return true;
  } catch (error) {
    console.error("Error delete ticket: ", error);
    return false;
  }
}

function isTicketValid(startTime, endTime) {
  const time1 = new Date(startTime).getTime();
  const time2 = new Date(endTime).getTime();

  if (time1 > time2) {
    return false;
  }
  return true;
}

// ------------------------------

// ------------ Log ------------

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
    console.error("Error create entry log: ", error);
    return false;
  }
}

async function getLog(idLog) {
  try {
    const logSnapshot = await logCollection.doc(idLog).get();
    return logSnapshot.data();
  } catch (error) {
    console.error("Error get entry log: ", error);
    return null;
  }
}

async function deleteLog(idLog) {
  try {
    await logCollection.doc(idLog).delete();
    console.log(`Entry log with ID ${idLog} deleted successfully.`);
    return true;
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
    const keyToken = `${tokenData.idDoor}-${tokenData.idAccount}`;
    const expiredTime = tokenData.expiredTime;

    const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${keyToken}`);
    await tokenRef.set({
      value: expiredTime,
    });
    console.log(
      `Token ${keyToken} with expired time ${expiredTime} added successfully.`
    );
    return true;
  } catch (error) {
    console.error("Error create token: ", error);
    return false;
  }
}

async function getToken(idToken) {
  try {
    const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idToken}`);
    const data = await tokenRef.once("value");
    return data.val();
  } catch (error) {
    console.error("Error get token: ", error);
    return false;
  }
}

async function updateToken(idToken, tokenDataUpdate) {
  try {
    const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idToken}`);
    await tokenRef.update({ value: tokenDataUpdate.expiredTime });
    console.log(
      `Token with ID ${idToken} updated with expired time: "${tokenDataUpdate.expiredTime}" successfully.`
    );
    return true;
  } catch (error) {
    console.error("Error update token: ", error);
    return false;
  }
}

async function deleteToken(idToken) {
  try {
    const tokenRef = rtdb.ref(`${constantValue.tokensCollection}/${idToken}`);
    await tokenRef.remove();
    console.log(`Token with ID ${idToken} deleted successfully.`);
    return true;
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
