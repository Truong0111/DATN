module.exports = function (authMiddleware, app) {
    let accountController = require("./Controllers/AccountController");
    let doorController = require("./Controllers/DoorController");
    let ticketController = require("./Controllers/TicketController");
    let logController = require("./Controllers/LogController");
    let tokenController = require("./Controllers/TokenController");

    app.route("/helloworld").get(async (req, res) => {
        res.status(200).send({message: "Hello world"});
    });

    app.route("/account/loginBiometric").post(accountController.loginBiometric);

    app.route("/account/login").post(accountController.loginAccount);

    app.route("/account/register").post(accountController.registerAccount);

    app.route("/account/count").get(accountController.getAccountsCount);

    app.route("/account/getAllAccounts").get(accountController.getAllAccounts);

    app
        .route("/account/:idAccount")
        .get(authMiddleware, accountController.getAccount)
        .patch(authMiddleware, accountController.updateAccount)
        .delete(authMiddleware, accountController.deleteAccount);

    app
        .route("/door").post(authMiddleware, doorController.accessDoor);

    app.route("/door/create").post(authMiddleware, doorController.createDoor);

    app.route("/door/addAccountAccessDoor").post(authMiddleware, doorController.addAccountAccessDoor);
    app.route("/door/removeAccountAccessDoor").post(authMiddleware, doorController.removeAccountAccessDoor);
    app.route("/door/getAccountsCanAccessDoor/:idDoor").get(authMiddleware, doorController.getAccountsCanAccessDoor);

    app
        .route("/door/getAll")
        .get(authMiddleware, doorController.getAllDoors);

    app
        .route("/door/:idDoor")
        .get(authMiddleware, doorController.getDoor)
        .patch(authMiddleware, doorController.updateDoor)
        .delete(authMiddleware, doorController.deleteDoor);

    app.route("/door/open")
        .post(authMiddleware, doorController.openDoor);

    app
        .route("/ticket/create")
        .post(authMiddleware, ticketController.createTicket);

    app.route("/ticket/getAll")
        .get(authMiddleware, ticketController.getAllTickets);

    app
        .route("/ticket/:idTicket")
        .get(authMiddleware, ticketController.getTicket)
        .patch(authMiddleware, ticketController.updateTicket)
        .delete(authMiddleware, ticketController.deleteTicket);

    app
        .route("/ticket/idAccount/:idAccount")
        .get(authMiddleware, ticketController.getTicketsByIdAccount);

    app.route("/ticket/idDoor/:idDoor")
        .get(authMiddleware, ticketController.getTicketsByIdDoor);

    app.route("/token/idDoor/:idDoor")
        .get(authMiddleware, tokenController.getTokenById)

    app.route("/token/getAll")
        .get(authMiddleware, tokenController.getAllTokens)

    app.route("/log/:date").get(authMiddleware, logController.getLogFileContent);

    app.route("/log").get(authMiddleware, logController.getLogFiles);
};
