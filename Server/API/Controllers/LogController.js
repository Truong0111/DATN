const logService = require("../../Firebase/FirebaseService").logService;

module.exports = {
    createLog: async (req, res) => {
        const logData = req.body;
        const createSuccess = await logService.createLog(logData);
        if (createSuccess) {
            res.status(200).send({message: 'Log created successfully.'});
        } else {
            res.status(400).send({message: 'Create log failed.'});
        }
    },
    getLog: async (req, res) => {
        const idLog = req.params.idLog;
        const log = await logService.getLog(idLog);
        if (log) {
            res.status(200).send(log);
        } else {
            res.status(404).send({message: 'Cannot get log log.'});
        }
    },
    deleteLog: async (req, res) => {
        const idLog = req.params.idLog;
        const deleteSuccess = await logService.deleteLog(idLog);
        if (deleteSuccess) {
            res.status(200).send({message: 'Log deleted successfully.'});
        } else {
            res.status(400).send({message: 'Delete log failed.'});
        }
    },
};
