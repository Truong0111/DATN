const accountService = require("../firestoreService");

module.exports = {
  loginAccount: async (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const loginSuccess = await accountService.loginAccount(username, password);
    if (loginSuccess) {
      res.status(200).send("Login successful.");
    } else {
      res.status(401).send("Invalid username or password.");
    }
  },
  registerAccount: async (req, res) => {
    const accountData = req.body;
    const registerSuccess = await accountService.registerAccount(accountData);
    if (registerSuccess) {
      res.status(200).send("Register successful.");
    } else {
      res.status(400).send("Register failed.");
    }
  },
  getAccount: async (req, res) => {
    const idAccount = req.params.idAccount;
    const account = await accountService.getAccount(idAccount);
    if (account) {
      res.status(200).send(account);
    } else {
      res.status(404).send("Account not found.");
    }
  },
  updateAccount: async (req, res) => {
    const idAccount = req.params.idAccount;
    const accountDataUpdate = req.body;
    const updateSuccess = await accountService.updateAccount(
      idAccount,
      accountDataUpdate
    );
    if (updateSuccess) {
      res.status(200).send("Update successful.");
    } else {
      res.status(400).send("Update failed.");
    }
  },

  deleteAccount: async (req, res) => {
    const idAccountDelete = req.params.idAccountDelete;
    const idAccountDeleteBy = req.params.idAccountDeleteBy;
    const deleteSuccess = await accountService.deleteAccount(
      idAccountDelete,
      idAccountDeleteBy
    );
    if (deleteSuccess) {
      res.status(200).send("Delete successful.");
    } else {
      res.status(400).send("Delete failed.");
    }
  },
};
