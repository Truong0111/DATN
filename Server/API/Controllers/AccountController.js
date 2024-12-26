const jwt = require("jsonwebtoken");
const constantValue = require("../../constants.json");
const logger = require("../../winston");
require("dotenv").config({path: "../.env"});

const accountService = require("../../Service/AccountService");

module.exports = {
    registerAccount: async (req, res) => {
        const accountData = req.body;
        logger.info(`Request: register account from ${req.ip}`);
        const registerSuccess = await accountService.registerAccount(accountData);
        if (registerSuccess[0]) {
            res.status(200).send({message: registerSuccess[1]});
        } else {
            res.status(400).send({message: registerSuccess[1]});
        }
    },

    loginBiometric: async (req, res) => {
        const idAccount = req.body.idAccount;
        const type = req.body.typeApp;
        logger.info(`Request: login account from ${req.ip}`);

        const jwtToken = jwt.sign({idAccount}, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });
        if (jwtToken) {
            logger.info(`Response: Login successful on app ${type} for ${req.ip}`);
            res.status(200).json({message: "Login successful.", token: jwtToken});
        } else {
            res.status(401).json({message: "Invalid biometric data."});
        }

    },

    loginAccount: async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        const type = req.body.typeApp;

        logger.info(`Request: login account from ${req.ip}`);
        const userData = await accountService.loginAccount(username, password);

        if (userData) {
            const role = userData.role;
            const idAccount = userData.idAccount;
            const jwtToken = jwt.sign({idAccount}, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });

            switch (type) {
                case "app_manager":
                    if (role.includes("manager") || role.includes("admin")) {
                        logger.info(`Response: Login successful on app ${type} as ${role} for ${req.ip}`);
                        res.status(200).json({message: "Login successful.", token: jwtToken});
                    } else {
                        logger.info(`Response: Login failed on app ${type} as ${role} for ${req.ip}`);
                        res.status(403).json({message: "Access denied."});
                    }
                    break;
                case "app_user":
                    logger.info(`Response: Login successful on app ${type} as ${role} for ${req.ip}`);
                    res.status(200).json({message: "Login successful.", token: jwtToken});
                    break;
                case "web":
                    if (role.includes("manager") || role.includes("admin")) {
                        logger.info(`Response: Login successful on app ${type} as ${role} for ${req.ip}`);
                        res.status(200).json({message: "Login successful.", token: jwtToken});
                    } else {
                        logger.info(`Response: Login failed on app ${type} as ${role} for ${req.ip}`);
                        res.status(403).json({message: "Access denied."});
                    }
                    break;
                default:
                    logger.warn(`Response: Login failed on app ${type} for ${req.ip}`);
                    res.status(403).json({message: `App ${type} is not available.`});
                    break;
            }
        } else {
            logger.info(`Response: Invalid username: ${username} Or password from ${req.ip}`);
            res.status(401).json({message: "Invalid username or password."});
        }
    },

    getAccount: async (req, res) => {
        const idAccount = req.params.idAccount;
        logger.info(`Request: get account data from ${req.ip}`);
        const account = await accountService.getAccount(idAccount);
        if (account) {
            logger.info(`Response: Get account data successfully for ${req.ip}`);
            res.status(200).json(account);
        } else {
            logger.info(`Response: Get account data failed for ${req.ip}`);
            res.status(404).json({message: "Account not found."});
        }
    },

    updateAccount: async (req, res) => {
        const idAccount = req.params.idAccount;
        const accountDataUpdate = req.body;

        logger.info(`Request: update account data from ${req.ip}`);
        const updateSuccess = await accountService.updateAccount(
            idAccount,
            accountDataUpdate
        );
        if (updateSuccess) {
            logger.info(`Response: Update account data successfully for ${req.ip}`);
            res.status(200).json({message: "Update account successful."});
        } else {
            logger.info(`Response: Update account data failed for ${req.ip}`);
            res.status(400).json({message: "Update account failed."});
        }
    },

    deleteAccount: async (req, res) => {
        const idAccountDelete = req.params.idAccount;
        logger.info(`Request: delete account from ${req.ip}`);
        const deleteSuccess = await accountService.deleteAccount(idAccountDelete);
        if (deleteSuccess) {
            logger.info(`Response: Delete account successfully for ${req.ip}`);
            res.status(200).json({message: "Delete account successful."});
        } else {
            logger.info(`Response: Delete account failed for ${req.ip}`);
            res.status(400).json({message: "Delete account failed."});
        }
    },

    getAllAccounts: async (req, res) => {
        logger.info(`Request: get all accounts from ${req.ip}`);
        const accounts = await accountService.getAllAccounts();
        if (accounts) {
            logger.info(`Response: Get all accounts successfully for ${req.ip}`);
            res.status(200).json(accounts);
        } else {
            logger.info(`Response: No accounts found for ${req.ip}`);
            res.status(404).json({message: "No accounts found."});
        }
    },
};
