const WebSocket = require('ws');
const readline  = require('readline');
const CmdRadar  = require('./CmdsRadar'); // Include CmdsRadar.js
const wsport    = require('./WebSocketPorts'); // Include WebSocketPorts.js

// WebSocket Connect
const wss = new WebSocket(`ws://localhost:${wsport.DEVMGR_RADAR}`);

// Set up readline interface for terminal input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Send Data and Command
function sendCommand(CmdRadar, data) {
    if (wss.readyState === WebSocket.OPEN) {
        // Wrap the command and data into an object
        const message = { CmdRadar, data };

        // Send the JSON string to the server
        wss.send(JSON.stringify(message));
        console.log('Sent to server:', message);
    } else {
        console.error('WebSocket is not open. Cannot send command.');
    }
}

// Function to handle user input
function handleUserInput(input) {
    const commandIndex = parseInt(input, 10);

    // Validate input: check if it's a valid command index
    if (!Object.values(CmdRadar).includes(commandIndex)) {
        console.log(`Invalid command. Available commands are: ${JSON.stringify(CmdRadar)}`);
        return;
    }

    // Send the selected command with some example data
    const data = { user: 'testUser', timestamp: Date.now() };
    sendCommand(commandIndex, data);
}

// Connection Event of WebSocket
wss.on('open', () => {
    console.log('Connected to server.');
    console.log(`Available commands: ${JSON.stringify(CmdRadar)}`);
    console.log('Enter a number corresponding to the command:');
    console.log(CmdRadar.START);

    // Example usage of the sendCommand function
    //sendCommand(commands.START, { user: 'admin', timestamp: Date.now() });
});

// Message Receive Event of WebSocket
wss.on('message', (message) => {
    const response = JSON.parse(message);
    console.log('Received from server:', response);
});

// Error Event of WebSocket
wss.on('error', (error) => {
    console.error('WebSocket error:', error);
});

// Disconnection Event of WebSocket
wss.on('close', () => {
    console.log('Connection closed.');
    rl.close();
});

// Listen for terminal input
rl.on('line', (input) => {

    if (input.trim().toLowerCase() === 'exit') {
        console.log('Exiting program...');
        rl.close();
        wss.close(); // Close the WebSocket connection
        return;
    }

    handleUserInput(input);
});