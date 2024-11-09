const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../.env" });
const accountService = require("../../Firebase/FirebaseService").accountService;

module.exports = {
  loginAccount: async (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    const loginSuccess = await accountService.loginAccount(username, password);

    if (loginSuccess) {
      const role = loginSuccess.role;
      if (role.includes("manager") || role.includes("admin")) {
        const idAccount = loginSuccess.idAccount;
        const jwtToken = jwt.sign({ idAccount }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });
        res.status(200).json({ message: "Login succesful.", jwtToken });
      } else {
        res.status(403).send({ message: "User can't access." });
      }
    } else {
      res.status(401).send({ message: "Invalid username or password." });
    }
  },
  registerAccount: async (req, res) => {
    const accountData = req.body;
    const registerSuccess = await accountService.registerAccount(accountData);
    if (registerSuccess) {
      res.status(200).send({ message: "Register account successful." });
    } else {
      res.status(400).send({ message: "Register account failed." });
    }
  },
  getAccount: async (req, res) => {
    const idAccount = req.params.idAccount;
    const account = await accountService.getAccount(idAccount);
    if (account) {
      res.status(200).send(account);
    } else {
      res.status(404).send({ message: "Account not found." });
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
      res.status(200).send({ message: "Update account successful." });
    } else {
      res.status(400).send({ message: "Update account failed." });
    }
  },

  deleteAccount: async (req, res) => {
    const idAccountDelete = req.params.idAccount;

    const deleteSuccess = await accountService.deleteAccount(idAccountDelete);
    if (deleteSuccess) {
      res.status(200).send({ message: "Delete account successful." });
    } else {
      res.status(400).send({ message: "Delete account failed." });
    }
  },
  getAllAccounts: async (req, res) => {
    try {
      const accounts = await accountService.getAllAccounts();
      if (accounts) {
        res.status(200).send(accounts);
      } else {
        res.status(404).send({ message: "No accounts found." });
      }
    } catch (error) {
      console.error("Error getting all accounts:", error);
      res.status(500).send({ message: "Error retrieving accounts." });
    }
  },
};
