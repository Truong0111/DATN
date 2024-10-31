const ticketService = require("../../Firebase/FirebaseService").ticketService;

module.exports = {
  createTicket: async (req, res) => {
    const ticketData = req.body;
    
    const createSuccess = await ticketService.createTicket(ticketData);
    if (createSuccess) {
      res.status(200).send("Create ticket successful.");
    } else {
      res.status(400).send("Create ticket failed.");
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
      res.status(200).send("Update ticket successful.");
    } else {
      res.status(400).send("Update ticket failed.");
    }
  },
  deleteTicket: async (req, res) => {
    const idTicket = req.params.idTicket;
    const deleteSuccess = await ticketService.deleteTicket(idTicket);
    if (deleteSuccess) {
      res.status(200).send("Delete ticket successful.");
    } else {
      res.status(400).send("Delete ticket failed.");
    }
  },
};
