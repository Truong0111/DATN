const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8181 });
console.log('WebSocket server is running on ws://localhost:8181');

wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    console.log('New client connected');

    ws.on('message', (message) => {
        try {
            console.log(`Received message: ${message}`);
            ws.send(`Echo: ${message}`);
        } catch (error) {
            console.log(`Error handling message: ${error.message}`);
        }
    });

    ws.on('error', (error) => {
        console.log(`WebSocket error: ${error.message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log('Terminating stale client connection');
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

module.exports = wss