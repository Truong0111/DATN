module.exports = function (authMiddleware, app) {
  let accountController = require("./Controllers/AccountController");
  let doorController = require("./Controllers/DoorController");
  let ticketController = require("./Controllers/TicketController");
  let tokenController = require("./Controllers/TokenController");
  let logController = require("./Controllers/LogController");

  app.route("/helloword").get(async (req, res) => {
    res.status(200).send("Hello word");
  });

  app.route("/account/login").post(accountController.loginAccount);

  app.route("/account/register").post(accountController.registerAccount);

  app.route("/account/getAllAccounts").get(accountController.getAllAccounts);

  app
    .route("/account/:idAccount")
    .get(authMiddleware, accountController.getAccount)
    .patch(authMiddleware, accountController.updateAccount)
    .delete(authMiddleware, accountController.deleteAccount);

  app.route("/door/create").post(authMiddleware, doorController.createDoor);

  app
    .route("/door/getAllDoors")
    .get(authMiddleware, doorController.getAllDoors);

  app
    .route("/door/:idDoor")
    .get(authMiddleware, doorController.getDoor)
    .patch(authMiddleware, doorController.updateDoor)
    .delete(authMiddleware, doorController.deleteDoor);

  app
    .route("/ticket/create")
    .post(authMiddleware, ticketController.createTicket);

  app
    .route("/ticket/getAllTickets/:idAccount")
    .get(authMiddleware, ticketController.getTickets);

  app
    .route("/ticket/:idTicket")
    .get(authMiddleware, ticketController.getTicket)
    .patch(authMiddleware, ticketController.updateTicket)
    .delete(authMiddleware, ticketController.deleteTicket);

  app.route("/token/create").post(tokenController.createToken);

  app
    .route("/token/getTokenByUserId/:idAccount")
    .get(tokenController.getTokenByUserId);

  app
    .route("/token/getTokenByDoorId/:idDoor")
    .get(tokenController.getTokenByDoorId);

  app
    .route("/token/getTokenByUserIdAndDoorId/:idAccount/:idDoor")
    .get(tokenController.getTokenByUserIdAndDoorId);

  app
    .route("/token/:idToken")
    .get(authMiddleware, tokenController.getToken)
    .patch(authMiddleware, tokenController.updateToken)
    .delete(authMiddleware, tokenController.deleteToken);

  app.route("/log/create").post(logController.createLog);

  app
    .route("/log/:idLog")
    .get(authMiddleware, logController.getLog)
    .delete(authMiddleware, logController.deleteLog);
};