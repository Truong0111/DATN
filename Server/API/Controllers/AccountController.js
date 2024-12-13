const jwt = require("jsonwebtoken");
const constantValue = require("../../constants.json");
require("dotenv").config({path: "../.env"});

const accountService = require("../../Service/AccountService");
const logService = require("../../Service/LogService");

module.exports = {
    registerAccount: async (req, res) => {
        const accountData = req.body;
        const registerSuccess = await accountService.registerAccount(accountData);
        if (registerSuccess[0]) {
            res.status(200).send({message: registerSuccess[1]});
        } else {
            res.status(400).send({message: registerSuccess[1]});
        }
    },

    loginAccount: async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        const type = req.body.typeApp;

        const userData = await accountService.loginAccount(username, password);

        if (userData) {
            const role = userData.role;
            const idAccount = userData.idAccount;
            const jwtToken = jwt.sign({idAccount}, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });

            switch (type) {
                case "app_manager" || "web":
                    if (role.includes("manager") || role.includes("admin")) {
                        await logService.createLogNormal(
                            constantValue.levelLog.LOG_INFO,
                            constantValue.services.AccountService,
                            `Login successful: Email: ${userData.email}; Role: ${userData.role}; Type app: ${type}`,
                            {
                                action: "Login account",
                            });
                        res.status(200).json({message: "Login successful.", token: jwtToken});
                    } else {
                        await logService.createLogNormal(
                            constantValue.levelLog.LOG_INFO,
                            constantValue.services.AccountService,
                            `Access denied: Email: ${userData.email}; Role: ${userData.role}; Type app: ${type}`,
                            {
                                action: "Login account",
                            });
                        res.status(403).json({message: "Access denied."});
                    }
                    break;
                case "app_user":
                    await logService.createLogNormal(
                        constantValue.levelLog.LOG_INFO,
                        constantValue.services.AccountService,
                        `Login successful: Email: ${userData.email}; Role: ${userData.role}; Type app: ${type}`,
                        {
                            action: "Login account",
                        });
                    res.status(200).json({message: "Login successful.", token: jwtToken});
                    break;
                default:
                    await logService.createLogNormal(
                        constantValue.levelLog.LOG_INFO,
                        constantValue.services.AccountService,
                        `Access denied: Email: ${userData.email}; Role: ${userData.role}; Type app: ${type}`,
                        {
                            action: "Login account",
                        });
                    res.status(403).json({message: "Access denied."});
                    break;
            }
        } else {
            await logService.createLogNormal(
                constantValue.levelLog.LOG_INFO,
                constantValue.services.AccountService,
                `Login failed: Email: ${userData.email}; Role: ${userData.role}; Type app: ${type}`,
                {
                    action: "Login account",
                    failureMessage: "Invalid username or password.",
                });
            res.status(401).json({message: "Invalid username or password."});
        }
    },

    getAccount: async (req, res) => {
        const idAccount = req.params.idAccount;
        const account = await accountService.getAccount(idAccount);
        if (account) {
            res.status(200).json(account);
        } else {
            res.status(404).json({message: "Account not found."});
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
            res.status(200).json({message: "Update account successful."});
        } else {
            res.status(400).json({message: "Update account failed."});
        }
    },

    deleteAccount: async (req, res) => {
        const idAccountDelete = req.params.idAccount;

        const deleteSuccess = await accountService.deleteAccount(idAccountDelete);
        if (deleteSuccess) {
            res.status(200).json({message: "Delete account successful."});
        } else {
            res.status(400).json({message: "Delete account failed."});
        }
    },

    getAllAccounts: async (req, res) => {
        try {
            const accounts = await accountService.getAllAccounts();
            if (accounts) {
                res.status(200).json(accounts);
            } else {
                res.status(404).json({message: "No accounts found."});
            }
        } catch (error) {
            console.error("Error getting all accounts:", error);
            res.status(500).json({message: "Error retrieving accounts."});
        }
    },
};
