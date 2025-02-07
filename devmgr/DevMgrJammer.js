const dgram = require('dgram'); // For UDP communication
const WebSocket = require('ws'); // For WebSocket communication
const Cmd = require('./CmdsJammer'); // Include CmdsJammer.js
const wsDevMgrPort = require('./PortsDevMgrWebSocket'); // Include DevMgrWebSocketPorts.js
const wsHalPort    = require('./HalWebSocketPorts');    // Include HalWebSocketPorts.js

// Constants and settings
const WS_DEVMGR_PORT = wsDevMgrPort.DEVMGR_JAMMER; // WebSocket Server port
const WS_HAL_PORT    = wsHalPort.DEVMGR_JAMMER; // WebSocket HAL port

const UDP_PORT       = 41442; // UDP port to listen on
const udpSocket = dgram.createSocket('udp4');

// Store connected WebSocket clients
let wsClients = new Set();

/**
 * Command execution handler
 * @param {number} commandIndex - Command index from the client
 * @param {object} data - Additional data for the command
 * @returns {object} - Response object
 */
// Commands Handler Function
const executeCommand = (commandIndex, data) => {
    switch (commandIndex) {
        case Cmd.START:
            return { message: 'System started successfully.', additionalInfo: data };
        case Cmd.STOP:
            return { message: 'System stopped successfully.', additionalInfo: data };
        case Cmd.RESTART:
            return { message: 'System restarted successfully.', additionalInfo: data };
        case Cmd.SET:
            return { message: 'System set: parameter set successfully.', additionalInfo: data };
        case Cmd.STATUS:
            return { message: 'System status: Operational.', additionalInfo: data };
        default:
            return { error: 'Invalid command.' };
    }
};

// Start WebSocket server
function startWebSocketServer() {
    // Create WebSocket Server
    const wss = new WebSocket.Server({ port: WS_DEVMGR_PORT });

    // Client Connection Event of WebSocket
    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');
        wsClients.add(ws);

        ws.on('message', (message) => {
            try {
                const { command, data } = JSON.parse(message);
                console.log('Received from client:', message);

                const response = executeCommand(command, data);
                ws.send(JSON.stringify({ response }));
            } catch (err) {
                ws.send(JSON.stringify({ error: 'Invalid message format.' }));
            }
        });

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
            wsClients.delete(ws);
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err.message);
        });
    });

    console.log(`WebSocket server running on ws://localhost:${WS_DEVMGR_PORT}`);
}

// Start UDP server
function startUDPServer() {
    udpSocket.on('message', (msg, rinfo) => {
        console.log(`Received UDP message from ${rinfo.address}:${rinfo.port}: ${msg}`);
        const message = msg.toString('utf-8');

        console.log(message);

        // Broadcast to WebSocket clients
        wsClients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            }
        });
    });

    udpSocket.on('error', (err) => {
        console.error(`UDP socket error: ${err.message}`);
        udpSocket.close();
    });

    udpSocket.bind(UDP_PORT, () => {
        console.log(`UDP server listening on port ${UDP_PORT}`);
    });
}

/**
 * UDP message send function
 * @param {string} message - Message to send
 * @param {string} targetIP - IP address of receiving device
 * @param {number} targetPort - Port number of receiving device
 */
function sendUDPMessage(message, targetIP, targetPort) {
    const buffer = Buffer.from(message, "utf-8");

    udpSocket.send(buffer, targetPort, targetIP, (err) => {
        if (err) {
            console.error(`Error sending UDP message: ${err.message}`);
        } else {
            console.log(`Sent UDP message to ${targetIP}:${targetPort} ->`, message);
        }
    });
}

// Start all servers
startWebSocketServer();
startUDPServer();

