const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../.env" });
const accountService = require("../../Firebase/FirebaseService").accountService;

module.exports = {
  loginAccount: async (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    
    const loginSuccess = await accountService.loginAccount(username, password);

    if (loginSuccess) {
      const jwtToken = jwt.sign({ username }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      res.status(200).json({ message: "Login succesful.", jwtToken });
    } else {
      res.status(401).send("Invalid username or password.");
    }
  },
  registerAccount: async (req, res) => {
    const accountData = req.body;
    const registerSuccess = await accountService.registerAccount(accountData);
    if (registerSuccess) {
      res.status(200).send("Register account successful.");
    } else {
      res.status(400).send("Register account failed.");
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
      res.status(200).send("Update account successful.");
    } else {
      res.status(400).send("Update account failed.");
    }
  },

  deleteAccount: async (req, res) => {
    const idAccountDelete = req.params.idAccount;

    const deleteSuccess = await accountService.deleteAccount(
      idAccountDelete,
    );
    if (deleteSuccess) {
      res.status(200).send("Delete account successful.");
    } else {
      res.status(400).send("Delete account failed.");
    }
  },
};
