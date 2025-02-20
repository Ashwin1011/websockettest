const WebSocket = require('ws');

class WebSocketManager {
    constructor() {
        this.clients = new Set();
    }

    addClient(ws) {
        this.clients.add(ws);
        console.log('New client connected');

        ws.on('close', () => {
            console.log('Client disconnected');
            this.clients.delete(ws);
        });
    }

    broadcast(message) {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    getClientCount() {
        return this.clients.size;
    }
}

// Create a singleton instance
const wsManager = new WebSocketManager();
module.exports = wsManager; 