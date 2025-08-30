// Chat functionality implementation
let socket;
let currentUser = '';

// DOM elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const chatInterface = document.getElementById('chatInterface');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const onlineCount = document.getElementById('onlineCount');

// Initialize chat functionality
function initializeChat(username) {
    currentUser = username;
    
    // Hide auth forms and show chat interface
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    chatInterface.style.display = 'flex';

    // Initialize Socket.io connection
    socket = io();
    
    // Emit event for WebRTC manager to initialize
    const socketConnectedEvent = new CustomEvent('socketConnected', { detail: { socket: socket } });
    document.dispatchEvent(socketConnectedEvent);

    // Register user with the server
    socket.emit('register', username);

    // Listen for messages
    socket.on('message', (data) => {
        addMessage(data.username, data.message, new Date(data.timestamp));
    });

    // Listen for user updates
    socket.on('updateUsers', (users) => {
        onlineCount.textContent = `${users.length} users online`;
    });

    // Listen for user join/leave notifications
    socket.on('userJoined', (username) => {
        addSystemMessage(`${username} joined the chat`);
    });

    socket.on('userLeft', (username) => {
        addSystemMessage(`${username} left the chat`);
    });

    // Listen for typing indicators
    socket.on('userTyping', (username) => {
        // Implement typing indicator if needed
    });

    socket.on('userStoppedTyping', () => {
        // Implement typing indicator if needed
    });
}

// Send message functionality
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && socket) {
        socket.emit('chatMessage', { message });
        addMessage(currentUser, message, new Date(), true);
        messageInput.value = '';
    }
}

// Add message to chat
function addMessage(username, message, timestamp, isOwn = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isOwn ? 'sent' : 'received');
    
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
        <strong>${isOwn ? 'You' : username}</strong>
        <p>${message}</p>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add system message
function addSystemMessage(message) {
    const systemElement = document.createElement('div');
    systemElement.classList.add('message', 'system');
    systemElement.innerHTML = `<em>${message}</em>`;
    systemElement.style.textAlign = 'center';
    systemElement.style.color = '#aaa';
    systemElement.style.fontStyle = 'italic';
    
    chatMessages.appendChild(systemElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Auth functions
window.showSignup = function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

window.showLogin = function() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Login functionality
document.getElementById('loginBtn').addEventListener('click', function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email && password) {
        // For demo purposes, we'll use the email username as the display name
        const username = email.split('@')[0];
        initializeChat(username);
    } else {
        alert('Please enter both email and password.');
    }
});

// Signup functionality
document.getElementById('signupBtn').addEventListener('click', function() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
    } else if (name && email && password) {
        initializeChat(name);
    } else {
        alert('Please fill in all fields.');
    }
});

// Remove placeholder call functionality
document.getElementById('audioCallBtn').addEventListener('click', function(e) {
    e.preventDefault();
    // Actual functionality is now handled by WebRTCManager
});

document.getElementById('videoCallBtn').addEventListener('click', function(e) {
    e.preventDefault();
    // Actual functionality is now handled by WebRTCManager
});
