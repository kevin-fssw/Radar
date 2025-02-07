const SerialPort = require('serialport'); // For serial communication
const ByteLength = require('@serialport/parser-byte-length'); // For fixed length parsing

// Configure the serial port
const port = new SerialPort('/dev/ttyUSB0', {
    baudRate: 9600, // Standard baud rate for PELCO
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
});

const unitID = 0x00; // Camera Address

const protocolType = 'D';

// Define the Sync Byte based on the protocol type
const syncByte = protocolType === 'P' ? 0xA0 : 0xFF; // 0xA0 for PELCO-P, 0xFF for PELCO-D

// Add a parser to handle fixed-length PELCO responses
const parser = port.pipe(new ByteLength({ length: 7 }));

/**
 * Calculate checksum for a PELCO command
 * @param {Array<number>} command - The command array without checksum
 * @returns {number} - The calculated checksum
 */
function calculateChecksum(command) {
    return command.reduce((sum, byte) => sum + byte, 0) % 0x0100; // 0x0100 = 256
}

/**
 * Send a PELCO command
 * @param {number} unitID - Camera address (0x01 ~ 0xFF)
 * @param {number} command1 - Command1 byte
 * @param {number} command2 - Command2 byte
 * @param {number} data1 - Data1 byte (e.g., speed or zoom level)
 * @param {number} data2 - Data2 byte (e.g., speed or zoom level)
 */
function sendPelcoCommand(unitID, command1, command2, data1, data2) {
    const command = [syncByte, unitID, command1, command2, data1, data2];
    const checksum = calculateChecksum(command);
    const packet = [...command, checksum];

    port.write(Buffer.from(packet), (err) => {
        if (err) {
            console.error('Error sending command:', err.message);
        } else {
            console.log(`Command sent: ${packet.map((b) => b.toString(16).padStart(2, '0')).join(' ')}`);
        }
    });
}

function panLeft(unitID, speed) {
    sendPelcoCommand(unitID, 0x00, 0x04, speed, 0x00);
}

function panRight(unitID, speed) {
    sendPelcoCommand(unitID, 0x00, 0x02, speed, 0x00);
}

function tiltUp(unitID, speed) {
    sendPelcoCommand(unitID, 0x00, 0x08, 0x00, speed);
}

function tiltDown(unitID, speed) {
    sendPelcoCommand(unitID, 0x00, 0x10, 0x00, speed);
}

function panStop(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x00, 0x00, 0x00);
}

function tiltStop(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x00, 0x00, 0x00);
}

function zoomTele(unitID) { // Zoom In
    sendPelcoCommand(unitID, 0x00, 0x20, 0x00, 0x00);
}

function zoomWide(unitID) { // Zoom Out
    sendPelcoCommand(unitID, 0x00, 0x40, 0x00, 0x00);
}

function focusNear(unitID) {
    sendPelcoCommand(unitID, 0x01, 0x00, 0x00, 0x00);
}

function focusFar(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x80, 0x00, 0x00);
}

function zoomStop(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x00, 0x00, 0x00);
}

function fucusStop(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x00, 0x00, 0x00);
}

function setPreset(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x03, 0x00, 0x00);
}

function goToPreset(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x07, 0x00, 0x00);
}

function clearPreset(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x05, 0x00, 0x00);
}

function setPresetSpeed(unitID, speed) { // Global Systems Only
    sendPelcoCommand(unitID, 0x00, 0x04, speed, 0x00);
}

function setPresetStayTime(unitID, time) { // Global Systems Only
    sendPelcoCommand(unitID, 0x00, 0x04, 0x00, time);
}

function loadPresetForLa(unitID) { // Global Systems Only
    sendPelcoCommand(unitID, 0x00, 0x14, 0x00, 0x00);
}

function savePresetForLa(unitID) { // Global Systems Only
    sendPelcoCommand(unitID, 0x00, 0x09, 0x00, 0x00);
}

function setPanSpeed(unitID, speed) {
    sendPelcoCommand(unitID, 0x00, 0x49, speed, 0x00);
}

function setTiltSpeed(unitID, speed) {
    sendPelcoCommand(unitID, 0x00, 0x4B, speed, 0x00);
}

function setSyncSpeed(unitID, speed) {
    sendPelcoCommand(unitID, 0x00, 0x48, speed, 0x00);
}

function setPanPosition(unitID, data1, data2) {
    sendPelcoCommand(unitID, 0x00, 0x45, data1, data2);
}

function setTiltPosition(unitID, data1, data2) {
    sendPelcoCommand(unitID, 0x00, 0x47, data1, data2);
}

function setZoomPosition(unitID, data1, data2) {
    sendPelcoCommand(unitID, 0x00, 0x37, data1, data2);
}

function setFocusPosition(unitID, data1, data2) {
    sendPelcoCommand(unitID, 0x00, 0x39, data1, data2);
}

function colorCamOn(unitID) {
    sendPelcoCommand(unitID, 0x88, 0x00, 0x00, 0x00);
}

function colorCamOff(unitID) {
    sendPelcoCommand(unitID, 0x08, 0x00, 0x00, 0x00);
}

function panMotorOn(unitID) {
    sendPelcoCommand(unitID, 0x88, 0x00, 0x03, 0x00);
}

function panMotorOff(unitID) {
    sendPelcoCommand(unitID, 0x08, 0x00, 0x03, 0x00);
}

function tiltMotorOn(unitID) {
    sendPelcoCommand(unitID, 0x88, 0x00, 0x04, 0x00);
}

function tiltMotorOff(unitID) {
    sendPelcoCommand(unitID, 0x08, 0x00, 0x04, 0x00);
}

function heaterOn(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x00, 0x06, 0x00);
}

function heaterOff(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x00, 0x06, 0x00);
}

function coolerOn(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x00, 0x07, 0x00);
}

function coolerOff(unitID) {
    sendPelcoCommand(unitID, 0x00, 0x00, 0x07, 0x00);
}


//
// Handle incoming data (optional, if camera sends responses)
parser.on('data', (data) => {
    console.log('Received response:', data.toString('hex'));
});


// Usage examples
panRight(0x01, 0x20); // Move camera to the right at speed 32
setTimeout(() => panStop(0x01), 2000); // Stop movement after 2 seconds
tiltUp(0x01, 0x15); // Tilt up at speed 21
setTimeout(() => tiltStop(0x01), 2000); // Stop movement after 2 seconds
zoomTele(0x01); // Zoom in
setTimeout(() => zoomWide(0x01), 2000); // Zoom out after 2 seconds
