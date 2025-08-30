const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle registration
app.post('/register', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.createUser(email, password);

        res.json({
            success: true,
            message: 'User created successfully!',
            user: { email: user.email, id: user.id }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Handle login
app.post('/login', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const { email, password } = req.body;
        const isValid = await db.verifyUser(email, password);

        if (isValid) {
            res.json({
                success: true,
                message: 'Login successful!',
                user: { email: email }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user registration for chat
    socket.on('register', (username) => {
        socket.username = username;
        socket.broadcast.emit('userJoined', username);
        io.emit('updateUsers', getConnectedUsers());
    });

    // Handle chat messages
    socket.on('chatMessage', (data) => {
        io.emit('message', {
            username: socket.username,
            message: data.message,
            timestamp: new Date().toISOString()
        });
    });

    // Handle typing indicators
    socket.on('typing', () => {
        socket.broadcast.emit('userTyping', socket.username);
    });

    socket.on('stopTyping', () => {
        socket.broadcast.emit('userStoppedTyping');
    });

    // WebRTC signaling
    socket.on('offer', (data) => {
        socket.to(data.target).emit('offer', {
            offer: data.offer,
            sender: socket.id
        });
    });

    socket.on('answer', (data) => {
        socket.to(data.target).emit('answer', {
            answer: data.answer,
            sender: socket.id
        });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.target).emit('ice-candidate', {
            candidate: data.candidate,
            sender: socket.id
        });
    });

    socket.on('callUser', (data) => {
        socket.to(data.target).emit('callMade', {
            offer: data.offer,
            sender: socket.id,
            username: socket.username,
            isVideo: data.isVideo
        });
    });

    socket.on('endCall', (data) => {
        socket.to(data.target).emit('callEnded', {
            sender: socket.id
        });
    });

    socket.on('rejectCall', (data) => {
        socket.to(data.target).emit('callRejected', {
            sender: socket.id
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket.username) {
            socket.broadcast.emit('userLeft', socket.username);
            io.emit('updateUsers', getConnectedUsers());
        }
        console.log('User disconnected:', socket.id);
    });
});

// Helper function to get connected users
function getConnectedUsers() {
    const users = [];
    io.sockets.sockets.forEach(socket => {
        if (socket.username) {
            users.push(socket.username);
        }
    });
    return users;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
