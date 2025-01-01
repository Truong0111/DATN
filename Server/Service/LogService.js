const fs = require('fs').promises;
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');

module.exports = {
    getLogFiles,
    getLogFileContent,
};

async function getLogFiles() {
    try {
        const files = await fs.readdir(LOG_DIR);

        const logFiles = await Promise.all(
            files
                .filter(file => file.endsWith('.log'))
                .map(async file => {
                    const filePath = path.join(LOG_DIR, file);
                    const stats = await fs.stat(filePath);
                    return { file, mtime: stats.mtime };
                })
        );

        logFiles.sort((a, b) => b.mtime - a.mtime);

        return [true, 200, logFiles.map(log => log.file)];
    } catch (err) {
        return [false, 500, 'Unable to read log directory.'];
    }
}

async function getLogFileContent(selectedDate) {
    const logFile = path.join(LOG_DIR, `${selectedDate}.log`);

    try {
        await fs.access(logFile);

        const data = await fs.readFile(logFile, 'utf-8');
        const lines = data.split('\n').filter(line => line.trim() !== '');
        return [true, 200, lines];
    } catch (err) {
        if (err.code === 'ENOENT') {
            return [false, 404, 'Log file not found.'];
        }
        return [false, 500, 'Could not read log file'];
    }
}
