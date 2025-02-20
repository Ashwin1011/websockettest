let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 3000; // 3 seconds

function connect() {
    const ws = new WebSocket('ws://localhost:3000');

    console.log('Connected to WebSocket server');

    // Add heartbeat ping every 30 seconds
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
        }
    }, 30000);

    ws.onmessage = (event) => {
        console.log('Received message:', event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'orderCreated') {
            console.log('New order created:', data.order);
        }
    };

    ws.onerror = (error) => {
        // console.log('Disconnected from WebSocket server:', event.code, event.reason);
        clearInterval(pingInterval);

        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
            console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
            setTimeout(() => {
                reconnectAttempts++;
                connect();
            }, reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
        }

    };

    ws.onclose = (event) => {
        console.log('Disconnected from WebSocket server:', event.code, event.reason);
        clearInterval(pingInterval);

        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
            console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
            setTimeout(() => {
                reconnectAttempts++;
                connect();
            }, reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    };
}

// Start the initial connection
connect();