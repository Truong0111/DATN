const accountService = require("../../Firebase/FirebaseService");

module.exports = {
  createLog: async (req, res) => {
    const logData = req.body;
    const createSuccess = await logService.createLog(logData);
    if (createSuccess) {
      res.status(200).send("Create successful.");
    } else {
      res.status(400).send("Create failed.");
    }
  },
  getLog: async (req, res) => {
    const idLog = req.params.idLog;
    const log = await logService.getLog(idLog);
    if (log) {
      res.status(200).send(log);
    } else {
      res.status(404).send("Log not found.");
    }
  },
  deleteLog: async (req, res) => {
    const idLog = req.params.idLog;
    const deleteSuccess = await logService.deleteLog(idLog);
    if (deleteSuccess) {
      res.status(200).send("Delete successful.");
    } else {
      res.status(400).send("Delete failed.");
    }
  },
};
