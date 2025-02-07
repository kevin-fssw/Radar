const dgram = require('dgram'); // UDP communication module
const { MAVLink20Processor, messages } = require('node-mavlink');

// Initialize MAVLink processor
const mavlink = new MAVLink20Processor();

// Configure UDP socket
const udpClient = dgram.createSocket('udp4');
const CAMERA_IP = '192.168.1.20'; // Camera IP address
const CAMERA_PORT = 14550;       // Camera MAVLink UDP port

/**
 * Send a MAVLink COMMAND_LONG message to control the camera.
 *
 * @param {number} commandId - MAV_CMD_DO_DIGICAM_CONTROL subcommand ID
 * @param {number[]} params - Up to 7 parameters required for the command
 */
function sendCameraCommand(commandId, params = []) {
  const commandLong = new messages.CommandLong(
    1,        // target_system: Camera system ID (typically 1)
    1,        // target_component: Camera component ID (typically 1)
    203,      // command: MAV_CMD_DO_DIGICAM_CONTROL
    0,        // confirmation: No confirmation required
    commandId, // param1: OS_Cmd (subcommand ID)
    params[0] || 0, // param2: OS_Param_1
    params[1] || 0, // param3: OS_Param_2
    params[2] || 0, // param4: OS_Param_3
    params[3] || 0, // param5: OS_Param_4
    params[4] || 0, // param6: OS_Param_5
    params[5] || 0  // param7: OS_Param_6
  );

  // Encode the message into a MAVLink data packet
  const packet = mavlink.pack(commandLong);

  // Send the packet via UDP
  udpClient.send(packet, CAMERA_PORT, CAMERA_IP, (err) => {
    if (err) {
      console.error(`Failed to send command: ${err.message}`);
    } else {
      console.log(`Command sent: ID=${commandId}, Params=${params}`);
    }
  });
}

// Handle incoming UDP messages (for response validation)
udpClient.on('message', (msg) => {
  console.log('Received response:', msg.toString());
});

// Example usage
// Set camera mode (Mode 3: Observation)
sendCameraCommand(0, [3]);

// Take a snapshot
sendCameraCommand(1, [0]); // Channel 0 snapshot

// Set recording state (1: Enable)
sendCameraCommand(2, [1, 0]); // Start recording on channel 0
