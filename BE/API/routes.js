module.exports = function (app) {
  let accountController = require("./Controllers/AccountController");
  let doorController = require("./Controllers/DoorController");
  let ticketController = require("./Controllers/TicketController");
  let tokenController = require("./Controllers/TokenController");
  let logController = require("./Controllers/LogController");

  app
    .route("/account")
    .get(accountController.loginAccount)
    .post(accountController.registerAccount);

  app
    .route("/account/:idAccount")
    .get(accountController.getAccount)
    .patch(accountController.updateAccount)
    .delete(accountController.deleteAccount);

  app.route("/door").post(doorController.createDoor);

  app
    .route("/door/:idDoor")
    .get(doorController.getDoor)
    .patch(doorController.updateDoor)
    .delete(doorController.deleteDoor);

  app.route("/ticket").post(ticketController.createTicket);

  app
    .route("/ticket/:idTicket")
    .get(ticketController.getTicket)
    .patch(ticketController.updateTicket)
    .delete(ticketController.deleteTicket);

  app.route("/token").post(tokenController.createToken);

  app
    .route("/token/:idToken")
    .patch(tokenController.updateToken)
    .get(tokenController.getToken)
    .delete(tokenController.deleteToken);

  app.route("/log").post(logController.createLog);

  app
    .route("/log/:idLog")
    .get(logController.getLog)
    .delete(logController.deleteLog);
};
