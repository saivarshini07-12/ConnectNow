# 🚀 ConnectNow - Real-time Chat Application

A modern, full-stack real-time chat application built with **Node.js**, **Express**, **Socket.io**, **HTML**, **CSS**, and **JavaScript**. Similar to WhatsApp, it features real-time messaging, multiple chat rooms, and an elegant UI with gradient backgrounds and smooth animations.

![ConnectNow](https://img.shields.io/badge/version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/node.js->=14.0-green)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## ✨ Features

### Real-time Communication
- **Instant Messaging**: Messages delivered immediately to all users in a room
- **Live User Status**: See when users join and leave
- **Active Users List**: View all currently connected users in your room
- **Auto-scroll**: Chat always scrolls to the latest message

### Multiple Rooms
- **Create Rooms**: Start a new chat room instantly
- **Join Rooms**: Enter existing rooms with a room ID
- **Room Management**: Automatic room cleanup when empty

### User Experience
- **Modern UI**: Beautiful gradient backgrounds (purple, pink, blue theme)
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: CSS animations for messages, buttons, and transitions
- **Input Validation**: Clear error messages for invalid inputs
- **Keyboard Shortcuts**: Send messages with Enter key

### Technical Features
- **Socket.io**: Real-time bidirectional communication
- **Express Server**: Lightweight, scalable backend
- **XSS Protection**: HTML escaping to prevent security vulnerabilities
- **Error Handling**: Comprehensive error management
- **Server Statistics**: Monitor active rooms and users

---

## 📁 Project Structure

```
ConnectNow/
├── public/                 # Frontend files (served as static)
│   ├── index.html         # Main HTML file
│   ├── style.css          # Styles and animations
│   └── script.js          # Frontend JavaScript logic
├── server/                # Backend utilities
│   └── roomManager.js     # Room and user management
├── server.js              # Main server entry point
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A terminal or command prompt
- A web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Install Dependencies

Navigate to the project folder and install required packages:

```bash
cd ConnectNow
npm install
```

This installs:
- `express` - Web server framework
- `socket.io` - Real-time communication
- `cors` - Cross-origin resource sharing

### Step 2: Start the Server

Run the server with:

```bash
npm start
```

or directly with:

```bash
node server.js
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║                    🚀 ConnectNow Server                     ║
╠════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:3000                   ║
║  Socket.io connected and ready for connections             ║
╚════════════════════════════════════════════════════════════╝
```

### Step 3: Open in Browser

Open your web browser and go to:

```
http://localhost:3000
```

---

## 📖 How to Use

### Creating a Chat Room

1. **Enter Username**: Type your name in the "Username" field
2. **Enter Room ID**: Create a unique room ID (e.g., "friends", "work-team", "gaming")
3. **Click "Create Room"**: This creates a new private chat space
4. **Start chatting**: Send messages that appear in real-time

### Joining an Existing Room

1. **Enter Username**: Type your name
2. **Enter Room ID**: Use the same room ID from the creator
3. **Click "Join Room"**: You'll be added to the existing room
4. **See Active Users**: All connected users are displayed
5. **Read Message History**: See all messages from the session

### Sending Messages

1. **Type Message**: Click in the input box and type your message
2. **Send Methods**:
   - Click the **Send Button** (circular arrow icon)
   - Press **Enter** key
3. **Receive Messages**: See messages from all room members
4. **Message Display**: Your messages appear on the right (blue), others on the left (gray)

### Leaving a Room

1. **Click "Leave"**: Button in the top right of the chat screen
2. **Confirmation**: You'll return to the join screen
3. **Notification**: Other users see that you left
4. **Room Cleanup**: Empty rooms are automatically deleted

---

## 💻 Technical Stack

### Frontend
- **HTML**: Semantic markup and accessibility
- **CSS**: Modern design with gradients and animations
- **JavaScript**: ES6 syntax, event handling, DOM manipulation
- **Socket.io Client**: Real-time event communication

### Backend
- **Node.js**: JavaScript runtime
- **Express**: HTTP server and routing
- **Socket.io**: WebSocket communication
- **CORS**: Cross-origin resource handling

---

## 🔐 Security Features

- **HTML Escaping**: Prevents XSS (Cross-Site Scripting) attacks
- **Input Validation**: Checks username and room ID format
- **Duplicate Prevention**: Prevents same username in same room
- **CORS Configuration**: Controls which origins can access the server

---

## 📊 API & Events

### Socket.io Events (Client → Server)

#### `userJoin`
User joins or creates a room
```javascript
socket.emit('userJoin', {
    username: 'John',
    roomId: 'friends',
    isCreating: true  // optional
});
```

#### `sendMessage`
User sends a message
```javascript
socket.emit('sendMessage', {
    username: 'John',
    roomId: 'friends',
    message: 'Hello everyone!',
    timestamp: Date.now()
});
```

#### `userLeave`
User leaves the room
```javascript
socket.emit('userLeave', {
    username: 'John',
    roomId: 'friends'
});
```

### Socket.io Events (Server → Client)

#### `roomJoined`
Confirmation of successful join
```javascript
{
    roomId: 'friends',
    username: 'John',
    users: ['John', 'Alice', 'Bob']
}
```

#### `receiveMessage`
New message received
```javascript
{
    username: 'Alice',
    message: 'Hi there!',
    roomId: 'friends',
    timestamp: 2024-03-31T...
}
```

#### `userJoined`
Another user joined
```javascript
{
    username: 'Charlie',
    users: ['John', 'Alice', 'Bob', 'Charlie']
}
```

#### `userLeft`
A user has left
```javascript
{
    username: 'Alice',
    users: ['John', 'Bob', 'Charlie']
}
```

#### `updateUsers`
User list updated
```javascript
{
    users: ['John', 'Bob', 'Charlie']
}
```

---

## 🎨 UI/UX Features

### Color Scheme
- **Primary Gradient**: Purple → Pink → Blue
- **Sent Messages**: Purple gradient
- **Received Messages**: Light gray
- **Buttons**: Interactive gradients with hover effects
- **System Messages**: Subtle gray with accent lines

### Animations
- **Fade In**: Page transitions
- **Slide Up/Down**: Form and card animations
- **Slide Right**: User badges
- **Message Slide In**: New messages
- **Shake**: Error messages
- **Scale**: Button hover effects

### Responsive Design
- **Desktop**: Full width with optimal spacing
- **Tablet**: Adjusted layout for medium screens
- **Mobile**: Optimized single-column layout

---

## 🚀 Running in Development Mode

For development with auto-reload, use:

```bash
npm run dev
```

Or install `nodemon` globally:

```bash
npm install -g nodemon
nodemon server.js
```

---

## 📱 Testing Multiple Users

To test with multiple users on the same computer:

1. **Open first browser tab**: `http://localhost:3000`
   - Username: Alice
   - Room: test-room
   - Click "Create Room"

2. **Open second browser tab**: `http://localhost:3000`
   - Username: Bob
   - Room: test-room
   - Click "Join Room"

3. **Send messages**: See real-time updates between tabs

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
**Solution**: Run `npm install` to install dependencies

### "Port 3000 is already in use"
**Solution**: 
- Change PORT in `server.js`
- Or kill the process: `lsof -i :3000` then `kill -9 <PID>`

### Messages not appearing
**Solution**:
- Check browser console for errors (F12)
- Ensure Socket.io is connected
- Verify both users are in the same room

### Room disappears after leaving
**This is expected** - Empty rooms are automatically deleted by the server

---

## 📝 Code Comments

The code includes extensive comments explaining:
- Function purposes and parameters
- Event handlers and their flow
- State management and data structures
- Security measures implemented
- Best practices and patterns

---

## 🎯 Future Enhancements

Potential features for future versions:
- 📧 Private direct messaging
- 🎨 Rich text formatting and emoji support
- 📎 File sharing and attachments
- 🔔 Notifications and sound alerts
- 👨‍💼 User profiles and avatars
- 🎮 Typing indicators ("User is typing...")
- 📱 Mobile app with React Native
- 🔐 User authentication and login
- 💾 Message persistence with database
- 🎤 Voice and video calling

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 👨‍💻 Author

Built with ❤️ as a real-time chat application demo

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📞 Support

If you encounter any issues:

1. **Check the console** (F12 in browser)
2. **Read the comments** in the code
3. **Verify dependencies** with `npm list`
4. **Restart the server** with Ctrl+C then `npm start`

---

## 🎉 Getting Started Quick Reference

```bash
# 1. Navigate to project
cd ConnectNow

# 2. Install dependencies
npm install

# 3. Start server
npm start

# 4. Open browser
# http://localhost:3000

# 5. Create or join a room and start chatting!
```

---

**Happy Chatting! 💬✨**