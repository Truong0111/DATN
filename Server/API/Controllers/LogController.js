const logService = require("../../Service/LogService");

module.exports = {
    createLog: async (req, res) => {
        const logData = req.body;
        const createSuccess = await logService.createLog(logData);
        if (createSuccess) {
            res.status(200).json({message: 'Log created successfully.'});
        } else {
            res.status(400).json({message: 'Create log failed.'});
        }
    },
    getLog: async (req, res) => {
        const idLog = req.params.idLog;
        const log = await logService.getLog(idLog);
        if (log) {
            res.status(200).json(log);
        } else {
            res.status(404).json({message: 'Cannot get log log.'});
        }
    },
    deleteLog: async (req, res) => {
        const idLog = req.params.idLog;
        const deleteSuccess = await logService.deleteLog(idLog);
        if (deleteSuccess) {
            res.status(200).json({message: 'Log deleted successfully.'});
        } else {
            res.status(400).json({message: 'Delete log failed.'});
        }
    },
};
