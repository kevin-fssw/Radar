const dgram = require('dgram'); // For UDP communication
const WebSocket = require('ws'); // For WebSocket communication
const Cmd = require('./CmdsCam'); // Include CmdsCam.js
const wsDevMgrPort = require('./PortsDevMgrWebSocket'); // Include DevMgrWebSocketPorts.js
const wsHalPort    = require('./HalWebSocketPorts');    // Include HalWebSocketPorts.js

// Constants and settings
const WS_DEVMGR_PORT = wsDevMgrPort.DEVMGR_CAMERA; // WebSocket Server port
const WS_HAL_PORT    = wsHalPort.DEVMGR_CAMERA; // WebSocket HAL port

const UDP_PORT       = 41441; // UDP port to listen on
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
        case Cmd.PAN_LEFT:
            return { message: 'PAN_LEFT ', additionalInfo: data };
            break;

        case Cmd.PAN_RIGHT:
            return { message: 'PAN_RIGHT ', additionalInfo: data };
            break;

        case Cmd.TILT_UP:
            return { message: 'TILT_UP ', additionalInfo: data };
            break;

        case Cmd.TILT_DOWN:
            return { message: 'TILT_DOWN ', additionalInfo: data };
            break;

        case Cmd.PAN_STOP:
            return { message: 'PAN_STOP ', additionalInfo: data };
            break;

        case Cmd.TILT_STOP:
            return { message: 'PAN_LEFT ', additionalInfo: data };
            break;

        case Cmd.ZOOM_TELE:
            return { message: 'TILT_STOP ', additionalInfo: data };
            break;

        case Cmd.ZOOM_WIDE:
            return { message: 'ZOOM_WIDE ', additionalInfo: data };
            break;

        case Cmd.FOCUS_NEAR:
            return { message: 'FOCUS_NEAR ', additionalInfo: data };
            break;

        case Cmd.FOCUS_FAR:
            return { message: 'FOCUS_FAR ', additionalInfo: data };
            break;

        case Cmd.ZOOM_STOP:
            return { message: 'ZOOM_STOP ', additionalInfo: data };
            break;

        case Cmd.FOCUS_STOP:
            return { message: 'FOCUS_STOP ', additionalInfo: data };
            break;

        case Cmd.SET_PERSET:
            return { message: 'SET_PERSET ', additionalInfo: data };
            break;

        case Cmd.GO_TO_PRESET:
            return { message: 'GO_TO_PRESET ', additionalInfo: data };
            break;

        case Cmd.CLEAR_PRESET:
            return { message: 'CLEAR_PRESET ', additionalInfo: data };
            break;

        case Cmd.SET_PRESET_SPEED:
            return { message: 'SET_PRESET_SPEED ', additionalInfo: data };
            break;

        case Cmd.SET_PRESET_STAY_TIME:
            return { message: 'SET_PRESET_STAY_TIME ', additionalInfo: data };
            break;

        case Cmd.LOAD_PRESET_FOR_LA:
            return { message: 'LOAD_PRESET_FOR_LA ', additionalInfo: data };
            break;

        case Cmd.SAVE_PRESET_FOR_LA:
            return { message: 'SAVE_PRESET_FOR_LA ', additionalInfo: data };
            break;

        case Cmd.SET_PAN_SPEED:
            return { message: 'SET_PAN_SPEED ', additionalInfo: data };
            break;

        case Cmd.SET_TILT_SPEED:
            return { message: 'SET_TILT_SPEED ', additionalInfo: data };
            break;

        case Cmd.SET_SYNC_SPEED:
            return { message: 'SET_SYNC_SPEED ', additionalInfo: data };
            break;

        case Cmd.SET_PAN_POSITION:
            return { message: 'SET_PAN_POSITION ', additionalInfo: data };
            break;

        case Cmd.SET_TILT_POSITION:
            return { message: 'SET_TILT_POSITION ', additionalInfo: data };
            break;

        case Cmd.SET_ZOOM_POSITION:
            return { message: 'SET_ZOOM_POSITION ', additionalInfo: data };
            break;

        case Cmd.SET_FOCUS_POSITION:
            return { message: 'SET_FOCUS_POSITION ', additionalInfo: data };
            break;

        case Cmd.COLOR_CAM_ON:
            return { message: 'COLOR_CAM_ON ', additionalInfo: data };
            break;

        case Cmd.COLOR_CAM_OFF:
            return { message: 'COLOR_CAM_OFF ', additionalInfo: data };
            break;

        case Cmd.PAN_MOTOR_ON:
            return { message: 'PAN_MOTOR_ON ', additionalInfo: data };
            break;

        case Cmd.PAN_MOTOR_OFF:
            return { message: 'PAN_MOTOR_OFF ', additionalInfo: data };
            break;

        case Cmd.TILT_MOTOR_ON:
            return { message: 'TILT_MOTOR_ON ', additionalInfo: data };
            break;

        case Cmd.TILT_MOTOR_OFF:
            return { message: 'TILT_MOTOR_OFF ', additionalInfo: data };
            break;

        case Cmd.HEATER_ON:
            return { message: 'HEATER_ON ', additionalInfo: data };
            break;

        case Cmd.HEATER_OFF:
            return { message: 'HEATER_OFF ', additionalInfo: data };
            break;

        case Cmd.COOLER_ON:
            return { message: 'COOLER_ON ', additionalInfo: data };
            break;

        case Cmd.COOLER_OFF:
            return { message: 'COOLER_OFF ', additionalInfo: data };
            break;

        default:
            return { error: 'Invalid command.' };
            break;

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

