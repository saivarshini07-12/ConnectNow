// =====================================================
// Room Manager - Manages chat rooms and users
// =====================================================

/**
 * RoomManager - Central class for managing rooms and users
 * Tracks active rooms, users in each room, and provides helper methods
 */
class RoomManager {
    constructor() {
        // Structure: { roomId: { users: [username1, username2], sockets: {username: socketId} } }
        this.rooms = {};
    }

    /**
     * Create a new room if it doesn't exist
     * @param {string} roomId - Room identifier
     */
    createRoom(roomId) {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = {
                users: [],
                sockets: {}, // Map of username to socketId
            };
            console.log(`✅ Room "${roomId}" created`);
        }
    }

    /**
     * Add user to a room
     * @param {string} roomId - Room identifier
     * @param {string} username - Username
     * @param {string} socketId - Socket.io socket ID
     * @returns {boolean} - True if successful, false if user already exists
     */
    addUserToRoom(roomId, username, socketId) {
        this.createRoom(roomId);

        // Check if user already exists in room
        if (this.rooms[roomId].sockets[username]) {
            return false;
        }

        // Add user
        this.rooms[roomId].users.push(username);
        this.rooms[roomId].sockets[username] = socketId;

        console.log(
            `👤 User "${username}" added to room "${roomId}". Total users: ${this.rooms[roomId].users.length}`
        );

        return true;
    }

    /**
     * Remove user from a room
     * @param {string} roomId - Room identifier
     * @param {string} username - Username
     * @returns {boolean} - True if user was removed, false if not found
     */
    removeUserFromRoom(roomId, username) {
        if (!this.rooms[roomId]) {
            return false;
        }

        const index = this.rooms[roomId].users.indexOf(username);
        if (index === -1) {
            return false;
        }

        this.rooms[roomId].users.splice(index, 1);
        delete this.rooms[roomId].sockets[username];

        console.log(
            `👤 User "${username}" removed from room "${roomId}". Total users: ${this.rooms[roomId].users.length}`
        );

        // Delete room if empty
        if (this.rooms[roomId].users.length === 0) {
            delete this.rooms[roomId];
            console.log(`🗑️  Empty room "${roomId}" deleted`);
        }

        return true;
    }

    /**
     * Get all users in a room
     * @param {string} roomId - Room identifier
     * @returns {array} - Array of usernames
     */
    getUsersInRoom(roomId) {
        if (!this.rooms[roomId]) {
            return [];
        }
        return this.rooms[roomId].users;
    }

    /**
     * Get socket ID of a user in a room
     * @param {string} roomId - Room identifier
     * @param {string} username - Username
     * @returns {string|null} - Socket ID or null if not found
     */
    getSocketId(roomId, username) {
        if (!this.rooms[roomId]) {
            return null;
        }
        return this.rooms[roomId].sockets[username] || null;
    }

    /**
     * Check if user exists in room
     * @param {string} roomId - Room identifier
     * @param {string} username - Username
     * @returns {boolean}
     */
    userExists(roomId, username) {
        return this.rooms[roomId] && this.rooms[roomId].users.includes(username);
    }

    /**
     * Get all active rooms
     * @returns {array} - Array of room IDs
     */
    getAllRooms() {
        return Object.keys(this.rooms);
    }

    /**
     * Get room details
     * @param {string} roomId - Room identifier
     * @returns {object} - Room data
     */
    getRoomDetails(roomId) {
        return this.rooms[roomId] || null;
    }

    /**
     * Get total number of active rooms
     * @returns {number}
     */
    getTotalRooms() {
        return Object.keys(this.rooms).length;
    }

    /**
     * Get total number of connected users across all rooms
     * @returns {number}
     */
    getTotalUsers() {
        let total = 0;
        for (const roomId in this.rooms) {
            total += this.rooms[roomId].users.length;
        }
        return total;
    }
}

// Export the RoomManager class
module.exports = RoomManager;
