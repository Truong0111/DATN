const logService = require("../../Service/LogService");
const logger = require("../../winston");
module.exports = {
    getLogFiles: async (req, res) => {
        logger.info(`Request: Get log files from ${req.ip}`);
        const logFile = await logService.getLogFiles();

        if (logFile[0]) {
            logger.info(`Response: Get log files successful for ${req.ip}`);
            res.status(logFile[1]).json(logFile[2]);
        } else {
            logger.warn(`Response: Get log files error for ${req.ip}`);
            res.status(logFile[1]).json(logFile[2]);
        }
    },

    getLogFileContent: async (req, res) => {
        const selectedDate = req.params.date;
        logger.info(`Request: Get log file content of ${selectedDate} from ${req.ip}`);
        const logFileContent = await logService.getLogFileContent(selectedDate);

        if (logFileContent[0]) {
            logger.info(`Response: Get log file content successful for ${req.ip}`);
            res.status(logFileContent[1]).json(logFileContent[2]);
        } else {
            logger.warn(`Response: Get log file content error for ${req.ip}`);
            res.status(logFileContent[1]).json(logFileContent[2]);
        }
    },
};
