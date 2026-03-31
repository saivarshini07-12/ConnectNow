// =====================================================
// ConnectNow - Frontend (Client-side) JavaScript
// =====================================================

// Initialize Socket.io connection
const socket = io();

// ===== State Management =====
const state = {
    username: '',
    roomId: '',
    isConnected: false,
    messages: [],
    activeUsers: [],
    replyingTo: null, // Track which message we're replying to
    selectedMessageId: null, // Track which message is highlighted
};

// ===== DOM Elements =====
const joinPage = document.getElementById('joinPage');
const chatPage = document.getElementById('chatPage');
const usernameInput = document.getElementById('username');
const roomIdInput = document.getElementById('roomId');
const joinBtn = document.getElementById('joinBtn');
const createBtn = document.getElementById('createBtn');
const joinError = document.getElementById('joinError');

const roomTitle = document.getElementById('roomTitle');
const userCount = document.getElementById('userCount');
const onlineCount = document.getElementById('onlineCount');
const usersList = document.getElementById('usersList');
const messagesContainer = document.getElementById('messagesContainer');
const systemMessagesContainer = document.getElementById('systemMessagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const leaveBtn = document.getElementById('leaveBtn');
const replyPreview = document.getElementById('replyPreview');
const replyUsername = document.getElementById('replyUsername');
const replyText = document.getElementById('replyText');
const cancelReplyBtn = document.getElementById('cancelReplyBtn');

// ===== Form Validation =====

/**
 * Validate username and room ID
 * @returns {boolean} - True if valid, false otherwise
 */
function validateInputs() {
    const username = usernameInput.value.trim();
    const roomId = roomIdInput.value.trim();

    if (!username) {
        showError('Please enter a username');
        return false;
    }

    if (!roomId) {
        showError('Please enter a room ID');
        return false;
    }

    if (username.length < 2) {
        showError('Username must be at least 2 characters');
        return false;
    }

    if (roomId.length < 2) {
        showError('Room ID must be at least 2 characters');
        return false;
    }

    return true;
}

/**
 * Display error message in UI
 * @param {string} message - Error message to display
 */
function showError(message) {
    joinError.textContent = message;
    joinError.style.display = 'block';

    // Clear error after 4 seconds
    setTimeout(() => {
        joinError.textContent = '';
        joinError.style.display = 'none';
    }, 4000);
}

// ===== Room Management =====

/**
 * Handle joining an existing room
 */
function joinRoom() {
    if (!validateInputs()) return;

    state.username = usernameInput.value.trim();
    state.roomId = roomIdInput.value.trim();

    // Emit join event to server
    socket.emit('userJoin', {
        username: state.username,
        roomId: state.roomId,
    });
}

/**
 * Handle creating a new room
 */
function createRoom() {
    if (!validateInputs()) return;

    state.username = usernameInput.value.trim();
    state.roomId = roomIdInput.value.trim();

    // Emit create room event to server
    socket.emit('userJoin', {
        username: state.username,
        roomId: state.roomId,
        isCreating: true,
    });
}

/**
 * Leave the current room
 */
function leaveRoom() {
    socket.emit('userLeave', {
        username: state.username,
        roomId: state.roomId,
    });

    // Reset state
    state.username = '';
    state.roomId = '';
    state.messages = [];
    state.activeUsers = [];

    // Clear inputs
    usernameInput.value = '';
    roomIdInput.value = '';

    // Switch to join page
    switchPage('joinPage');
}

// ===== Page Navigation =====

/**
 * Switch between pages
 * @param {string} pageName - Name of page to show ('joinPage' or 'chatPage')
 */
function switchPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Show target page with animation
    if (pageName === 'joinPage') {
        joinPage.classList.add('active');
    } else if (pageName === 'chatPage') {
        chatPage.classList.add('active');
        // Scroll to latest message when page loads
        setTimeout(() => scrollToBottom(), 100);
    }
}

// ===== Message Handling =====

/**
 * Send a message to the room
 */
function sendMessage() {
    const messageText = messageInput.value.trim();

    if (!messageText) return;

    // Prepare message data
    const messageData = {
        username: state.username,
        roomId: state.roomId,
        message: messageText,
        timestamp: new Date(),
    };

    // Include reply data if replying to someone
    if (state.replyingTo) {
        messageData.replyTo = {
            username: state.replyingTo.username,
            message: state.replyingTo.message,
        };
    }

    // Clear input
    messageInput.value = '';
    cancelReply();

    // Emit message to server
    socket.emit('sendMessage', messageData);

    // Focus back on input
    messageInput.focus();
}

/**
 * Set up reply to a specific message
 * @param {object} message - Message to reply to
 * @param {string} messageId - ID of the message element
 */
function setReply(message, messageId) {
    // Remove previous highlight
    if (state.selectedMessageId) {
        const prevElement = document.getElementById(state.selectedMessageId);
        if (prevElement) {
            prevElement.classList.remove('highlighted');
        }
    }

    // Highlight the selected message
    state.selectedMessageId = messageId;
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.classList.add('highlighted');
    }

    state.replyingTo = message;
    replyUsername.textContent = message.username;
    replyText.textContent = message.message.substring(0, 100) + (message.message.length > 100 ? '...' : '');
    replyPreview.style.display = 'flex';
    messageInput.focus();
}

/**
 * Cancel reply
 */
function cancelReply() {
    // Remove highlight from message
    if (state.selectedMessageId) {
        const messageElement = document.getElementById(state.selectedMessageId);
        if (messageElement) {
            messageElement.classList.remove('highlighted');
        }
    }

    state.replyingTo = null;
    state.selectedMessageId = null;
    replyPreview.style.display = 'none';
}

/**
 * Display a message in chat
 * @param {object} data - Message data
 * @param {boolean} isSent - Whether this is a sent message
 */
function displayMessage(data, isSent = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    messageDiv.id = messageId;

    // Get time
    const messageTime = new Date(data.timestamp || Date.now());
    const timeString = messageTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    // Build quoted message section if replying
    let quotedHTML = '';
    if (data.replyTo) {
        quotedHTML = `
            <div class="quoted-message">
                <div class="quoted-sender">↳ ${escapeHtml(data.replyTo.username)}</div>
                <div class="quoted-text">${escapeHtml(data.replyTo.message.substring(0, 100))}</div>
            </div>
        `;
    }

    messageDiv.innerHTML = `
        <div class="message-bubble">
            ${quotedHTML}
            <div class="message-sender">${escapeHtml(data.username)}</div>
            <div class="message-text">${escapeHtml(data.message)}</div>
            <div class="message-time">${timeString}</div>
            ${!isSent ? `<button class="reply-btn" data-message-id="${messageId}">↩️ Reply</button>` : ''}
        </div>
    `;

    messagesContainer.appendChild(messageDiv);

    // Add click event listener to select message for reply
    messageDiv.addEventListener('click', () => {
        setReply({
            username: data.username,
            message: data.message,
        }, messageId);
    });

    // Add reply button event listener for received messages
    if (!isSent) {
        const replyBtn = messageDiv.querySelector('.reply-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering message click
                setReply({
                    username: data.username,
                    message: data.message,
                }, messageId);
            });
            // Add hover effect to show reply button
            messageDiv.addEventListener('mouseenter', () => {
                replyBtn.style.opacity = '1';
            });
            messageDiv.addEventListener('mouseleave', () => {
                replyBtn.style.opacity = '0.6';
            });
        }
    }

    // Store message in state
    state.messages.push(data);

    // Auto scroll to latest message
    scrollToBottom();
}

/**
 * Display a system message
 * @param {string} message - System message text
 */
function displaySystemMessage(message) {
    const systemDiv = document.createElement('div');
    systemDiv.className = 'system-message';
    systemDiv.textContent = message;

    systemMessagesContainer.appendChild(systemDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        systemDiv.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => systemDiv.remove(), 300);
    }, 5000);

    scrollToBottom();
}

/**
 * Scroll messages container to bottom
 */
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

// ===== User List Management =====

/**
 * Update the active users display
 * @param {array} users - Array of active users
 */
function updateUsersList(users) {
    state.activeUsers = users;
    usersList.innerHTML = '';
    onlineCount.textContent = users.length;
    userCount.textContent = `${users.length} user${users.length !== 1 ? 's' : ''} online`;

    users.forEach(user => {
        const userBadge = document.createElement('div');
        userBadge.className = 'user-badge';
        userBadge.textContent = user;
        usersList.appendChild(userBadge);
    });
}

// ===== Socket.io Event Listeners =====

/**
 * Successfully joined a room
 */
socket.on('roomJoined', (data) => {
    state.isConnected = true;

    // Update page
    roomTitle.textContent = `Room: ${data.roomId}`;
    updateUsersList(data.users);

    // Clear messages
    messagesContainer.innerHTML = '';
    systemMessagesContainer.innerHTML = '';

    // Display welcome message
    displaySystemMessage(`Welcome to room "${data.roomId}"!`);
    displaySystemMessage(`You are logged in as "${state.username}"`);

    // Switch to chat page
    switchPage('chatPage');

    // Focus on input
    messageInput.focus();
});

/**
 * Receive a message
 */
socket.on('receiveMessage', (data) => {
    const isSent = data.username === state.username;
    displayMessage(data, isSent);
});

/**
 * User joined notification
 */
socket.on('userJoined', (data) => {
    displaySystemMessage(`${data.username} joined the room`);
    updateUsersList(data.users);
});

/**
 * User left notification
 */
socket.on('userLeft', (data) => {
    displaySystemMessage(`${data.username} left the room`);
    updateUsersList(data.users);
});

/**
 * Update users list
 */
socket.on('updateUsers', (data) => {
    updateUsersList(data.users);
    userCount.textContent = `${data.users.length} user${data.users.length !== 1 ? 's' : ''} online`;
});

/**
 * Error handling
 */
socket.on('error', (data) => {
    showError(data.message || 'An error occurred');
});

/**
 * Disconnection handling
 */
socket.on('disconnect', () => {
    state.isConnected = false;
    showError('Connection lost. Please refresh the page.');
});

// ===== Event Listeners =====

// Join Room Button
joinBtn.addEventListener('click', joinRoom);

// Create Room Button
createBtn.addEventListener('click', createRoom);

// Send Message Button
sendBtn.addEventListener('click', sendMessage);

// Leave Room Button
leaveBtn.addEventListener('click', leaveRoom);

// Cancel Reply Button
cancelReplyBtn.addEventListener('click', cancelReply);

// Send message on Enter key
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Enter key on room/username fields to join
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinRoom();
    }
});

roomIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinRoom();
    }
});

// Focus input on page load for better UX
window.addEventListener('load', () => {
    usernameInput.focus();
});

console.log('🚀 ConnectNow Client initialized');
