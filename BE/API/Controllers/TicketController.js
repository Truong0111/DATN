const accountService = require("../../Firebase/FirebaseService");

module.exports = {
  createTicket: async (req, res) => {
    const ticketData = req.body;
    const createSuccess = await ticketService.createTicket(ticketData);
    if (createSuccess) {
      res.status(200).send("Create successful.");
    } else {
      res.status(400).send("Create failed.");
    }
  },
  getTicket: async (req, res) => {
    const idTicket = req.params.idTicket;
    const ticket = await ticketService.getTicket(idTicket);
    if (ticket) {
      res.status(200).send(ticket);
    } else {
      res.status(404).send("Ticket not found.");
    }
  },
  updateTicket: async (req, res) => {
    const idTicket = req.params.idTicket;
    const ticketDataUpdate = req.body;
    const updateSuccess = await ticketService.updateTicket(
      idTicket,
      ticketDataUpdate
    );
    if (updateSuccess) {
      res.status(200).send("Update successful.");
    } else {
      res.status(400).send("Update failed.");
    }
  },
  deleteTicket: async (req, res) => {
    const idTicket = req.params.idTicket;
    const deleteSuccess = await ticketService.deleteTicket(idTicket);
    if (deleteSuccess) {
      res.status(200).send("Delete successful.");
    } else {
      res.status(400).send("Delete failed.");
    }
  },
};
