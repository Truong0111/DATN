const ticketService = require("../../Service/TicketService");
const {isArrayEmptyOrNull} = require("../../utils");
const logger = require("../../winston");

module.exports = {
    createTicket: async (req, res) => {
        const ticketData = req.body;

        logger.info(`Request: Create ticket from ${req.ip}`);
        const createSuccess = await ticketService.createTicket(ticketData);
        if (createSuccess) {
            logger.info(`Response: Create ticket successfully for ${req.ip}`);
            res.status(200).json({message: "Create ticket successful."});
        } else {
            logger.error(`Error: Create ticket failed for ${req.ip}`);
            res.status(400).json({message: "Create ticket failed."});
        }
    },
    getTicket: async (req, res) => {
        const idTicket = req.params.idTicket;
        logger.info(`Request: Get ticket data of ${idTicket} from ${req.ip}`);
        const ticket = await ticketService.getTicket(idTicket);
        if (ticket) {
            if (!isArrayEmptyOrNull(ticket)) {
                logger.info(`Response: Get ticket data successfully for ${req.ip}`);
                res.status(200).json(ticket);
            }
            else{
                logger.info(`Response: Ticket ${idTicket} not found for ${req.ip}`);
                res.status(404).json({message: "Ticket not found."});
            }
        } else {
            logger.info(`Response: Ticket ${idTicket} not found for ${req.ip}`);
            res.status(404).json({message: "Ticket not found."});
        }
    },
    acceptTicket: async (req, res) => {
        const idTicket = req.params.idTicket;
        logger.info(`Request: Accept ticket ${idTicket} from ${req.ip}`);
        const acceptSuccess = await ticketService.acceptTicket(idTicket);
        if (acceptSuccess) {
            logger.info(`Response: Accept ticket successfully for ${req.ip}`);
            res.status(200).json({message: "Accept ticket successful."});
        } else {
            logger.info(`Response: Accept ticket failed for ${req.ip}`);
            res.status(400).json({message: "Accept ticket failed."});
        }
    },
    updateTicket: async (req, res) => {
        const idTicket = req.params.idTicket;
        const ticketDataUpdate = req.body;
        logger.info(`Request: Update ticket ${idTicket} from ${req.ip}`);
        const updateSuccess = await ticketService.updateTicket(
            idTicket,
            ticketDataUpdate
        );
        if (updateSuccess) {
            logger.info(`Response: Update ticket successfully for ${req.ip}`);
            res.status(200).json({message: "Update ticket successful."});
        } else {
            logger.info(`Response: Update ticket failed for ${req.ip}`);
            res.status(400).json({message: "Update ticket failed."});
        }
    },
    deleteTicket: async (req, res) => {
        const idTicket = req.params.idTicket;
        logger.info(`Request: Delete ticket ${idTicket} from ${req.ip}`);
        const deleteSuccess = await ticketService.deleteTicket(idTicket);
        if (deleteSuccess) {
            logger.info(`Response: Delete ticket successfully for ${req.ip}`);
            res.status(200).json({message: "Delete ticket successful."});
        } else {
            logger.info(`Response: Delete ticket failed for ${req.ip}`);
            res.status(400).json({message: "Delete ticket failed."});
        }
    },
    getTicketsByIdAccount: async (req, res) => {
        const idAccount = req.params.idAccount;
        logger.info(`Request: Get tickets ref ${idAccount} from ${req.ip}`);
        const tickets = await ticketService.getTicketsByIdAccount(idAccount);
        if (tickets) {
            logger.info(`Request: Get tickets data ref ${idAccount} successfully for ${req.ip}`);
            res.status(200).json(tickets);
        } else {
            logger.info(`Response: Cannot get tickets data of ${idAccount} for ${req.ip}`);
            res.status(404).json({message: "Cannot get any ticket by id account."});
        }
    },

    getTicketsByIdDoor: async (req, res) => {
        const idDoor = req.params.idDoor;
        logger.info(`Request: Get tickets ref ${idDoor} from ${req.ip}`);
        const tickets = await ticketService.getTicketsByIdDoor(idDoor);
        if (tickets) {
            logger.info(`Response: Get tickets data ref ${idDoor} successfully for ${req.ip}`);
            res.status(200).json(tickets);
        } else {
            logger.info(`Response: Cannot get tickets data of ${idDoor} for ${req.ip}`);
            res.status(404).json({message: "Cannot get any ticket by id door."});
        }
    },

    getAllTickets: async (req, res) => {
        logger.info(`Request: Get all tickets from ${req.ip}`);
        const tickets = await ticketService.getAllTickets();
        if (tickets) {
            logger.info(`Response: Get all tickets data successfully for ${req.ip}`);
            res.status(200).json(tickets);
        } else {
            logger.info(`Response: Cannot get any tickets for ${req.ip}`);
            res.status(404).json({message: "Cannot get any tickets."});
        }
    },
};
