const winston = require('winston');
require('winston-daily-rotate-file');
const WebSocket = require("ws");
const wss = require('./websocket');
const Transport = require('winston-transport');
const path = require('path');

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, `logs/%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

class WebSocketTransport extends Transport {
    constructor(opts) {
        super(opts);
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(info));
            }
        });

        callback();
    }
}

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss'
        }),
        winston.format.printf(
            log => {
                if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
                return `[${log.timestamp}] [${log.level}] ${log.message}`;
            },
        ),
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.timestamp({
                    format: 'DD-MM-YYYY HH:mm:ss'
                }),
                winston.format.colorize(),
                winston.format.printf(
                    log => {
                        if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
                        return `[${log.timestamp}] [${log.level}] ${log.message}`;
                    },
                ),
            )
        }),
        dailyRotateFileTransport,
        new WebSocketTransport()
    ],
});

module.exports = logger;
