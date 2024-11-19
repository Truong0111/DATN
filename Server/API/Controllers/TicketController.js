const ticketService = require("../../Firebase/FirebaseService").ticketService;

module.exports = {
    createTicket: async (req, res) => {
        const ticketData = req.body;

        const createSuccess = await ticketService.createTicket(ticketData);
        if (createSuccess) {
            res.status(200).send({message: "Create ticket successful."});
        } else {
            res.status(400).send({message: "Create ticket failed."});
        }
    },
    getTicket: async (req, res) => {
        const idTicket = req.params.idTicket;
        const ticket = await ticketService.getTicket(idTicket);
        if (ticket) {
            res.status(200).send(ticket);
        } else {
            res.status(404).send({message: "Ticket not found."});
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
            res.status(200).send({message: "Update ticket successful."});
        } else {
            res.status(400).send({message: "Update ticket failed."});
        }
    },
    deleteTicket: async (req, res) => {
        const idTicket = req.params.idTicket;
        const deleteSuccess = await ticketService.deleteTicket(idTicket);
        if (deleteSuccess) {
            res.status(200).send({message: "Delete ticket successful."});
        } else {
            res.status(400).send({message: "Delete ticket failed."});
        }
    },
    getTicketsByIdAccount: async (req, res) => {
        const idAccount = req.params.idAccount;
        const tickets = await ticketService.getTicketsByIdAccount(idAccount);
        if (tickets) {
            res.status(200).send(tickets);
        } else {
            res.status(404).send({message: "Cannot get any ticket by id account."});
        }
    },

    getTicketsByIdDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        const tickets = await ticketService.getTicketsByIdDoor(idDoor);
        if (tickets) {
            res.status(200).send(tickets);
        } else {
            res.status(404).send({message: "Cannot get any ticket by id door."});
        }
    },

    getAllTicketsFromServer: async () => {
        return await ticketService.getAllTickets();
    }
};
