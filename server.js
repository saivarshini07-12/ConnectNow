// =====================================================
// ConnectNow - Main Server (Backend)
// =====================================================

// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const RoomManager = require('./server/roomManager');

// ===== Configuration =====
const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

// ===== Initialize Express App =====
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// ===== Initialize Room Manager =====
const roomManager = new RoomManager();

// ===== Routes =====

/**
 * Serve the main index page
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        activeRooms: roomManager.getTotalRooms(),
        totalUsers: roomManager.getTotalUsers(),
    });
});

/**
 * Get stats endpoint
 */
app.get('/api/stats', (req, res) => {
    res.json({
        activeRooms: roomManager.getTotalRooms(),
        totalUsers: roomManager.getTotalUsers(),
        rooms: roomManager.getAllRooms(),
    });
});

// ===== Socket.io Event Handlers =====

/**
 * Handle new socket connection
 */
io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    /**
     * Handle user joining a room
     * Event: 'userJoin'
     * Payload: { username, roomId, isCreating? }
     */
    socket.on('userJoin', (data) => {
        try {
            const { username, roomId } = data;

            // Validate input
            if (!username || !roomId) {
                socket.emit('error', {
                    message: 'Username and Room ID are required',
                });
                return;
            }

            // Check if user already exists in room
            if (roomManager.userExists(roomId, username)) {
                socket.emit('error', {
                    message: 'Username already taken in this room',
                });
                return;
            }

            // Add user to room
            roomManager.addUserToRoom(roomId, username, socket.id);

            // Store room and username in socket for later use
            socket.roomId = roomId;
            socket.username = username;

            // Join the socket to a room
            socket.join(roomId);

            // Get updated user list
            const users = roomManager.getUsersInRoom(roomId);

            // Notify the user
            socket.emit('roomJoined', {
                roomId: roomId,
                username: username,
                users: users,
                message: 'Successfully joined the room',
            });

            // Notify all users in room about new user
            io.to(roomId).emit('userJoined', {
                username: username,
                users: users,
                message: `${username} joined the room`,
            });

            console.log(
                `✅ User "${username}" joined room "${roomId}". Users in room: ${users.length}`
            );

            // Log server stats
            logServerStats();
        } catch (error) {
            console.error('Error in userJoin:', error);
            socket.emit('error', {
                message: 'An error occurred while joining the room',
            });
        }
    });

    /**
     * Handle sending a message
     * Event: 'sendMessage'
     * Payload: { username, roomId, message, timestamp, replyTo? }
     */
    socket.on('sendMessage', (data) => {
        try {
            const { username, roomId, message, replyTo } = data;

            // Validate input
            if (!username || !roomId || !message) {
                return;
            }

            // Verify user is in the room
            if (!roomManager.userExists(roomId, username)) {
                socket.emit('error', {
                    message: 'You are not in this room',
                });
                return;
            }

            // Prepare broadcast data
            const broadcastData = {
                username: username,
                message: message,
                roomId: roomId,
                timestamp: new Date(),
            };

            // Include reply data if present
            if (replyTo) {
                broadcastData.replyTo = replyTo;
            }

            // Broadcast message to all users in room
            io.to(roomId).emit('receiveMessage', broadcastData);

            console.log(`💬 Message from "${username}" in room "${roomId}": ${message.substring(0, 50)}...`);
        } catch (error) {
            console.error('Error in sendMessage:', error);
            socket.emit('error', {
                message: 'An error occurred while sending the message',
            });
        }
    });

    /**
     * Handle user leaving a room
     * Event: 'userLeave'
     * Payload: { username, roomId }
     */
    socket.on('userLeave', (data) => {
        try {
            const { username, roomId } = data;

            // Validate input
            if (!username || !roomId) {
                return;
            }

            // Remove user from room
            roomManager.removeUserFromRoom(roomId, username);

            // Leave the socket room
            socket.leave(roomId);

            // Notify remaining users
            const users = roomManager.getUsersInRoom(roomId);
            io.to(roomId).emit('userLeft', {
                username: username,
                users: users,
                message: `${username} left the room`,
            });

            io.to(roomId).emit('updateUsers', {
                users: users,
            });

            console.log(`👋 User "${username}" left room "${roomId}"`);
            logServerStats();
        } catch (error) {
            console.error('Error in userLeave:', error);
        }
    });

    /**
     * Handle socket disconnection
     */
    socket.on('disconnect', () => {
        try {
            const { username, roomId } = socket;

            if (username && roomId) {
                // Remove user from room
                roomManager.removeUserFromRoom(roomId, username);

                // Notify remaining users
                const users = roomManager.getUsersInRoom(roomId);
                io.to(roomId).emit('userLeft', {
                    username: username,
                    users: users,
                    message: `${username} left the chat`,
                });

                io.to(roomId).emit('updateUsers', {
                    users: users,
                });

                console.log(`⛔ User "${username}" disconnected from room "${roomId}"`);
                logServerStats();
            }

            console.log(`🔌 Client disconnected: ${socket.id}`);
        } catch (error) {
            console.error('Error in disconnect:', error);
        }
    });

    /**
     * Handle any errors
     */
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// ===== Utility Functions =====

/**
 * Log current server statistics
 */
function logServerStats() {
    console.log(`📊 Server Stats - Active Rooms: ${roomManager.getTotalRooms()}, Total Users: ${roomManager.getTotalUsers()}`);
}

// ===== Server Startup =====

/**
 * Start the server
 */
server.listen(PORT, HOST, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    🚀 ConnectNow Server                     ║
╠════════════════════════════════════════════════════════════╣
║  Server running at: http://${HOST}:${PORT}                          ║
║  Socket.io connected and ready for connections             ║
╚════════════════════════════════════════════════════════════╝
    `);
});

/**
 * Handle server errors
 */
server.on('error', (error) => {
    console.error('Server error:', error);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Export for testing purposes
module.exports = { app, server, io, roomManager };
