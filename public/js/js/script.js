// ================= EXISTING AUTH CODE =================
const formTitle = document.getElementById('form-title');
const toggleLink = document.getElementById('toggle-link');
let isLogin = true;

toggleLink.addEventListener('click', () => {
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? "Login" : "Signup";
    toggleLink.textContent = isLogin ? "Don't have an account? Signup" : "Already have an account? Login";
});

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    alert((isLogin ? "Logging in: " : "Signing up: ") + email);
});

// ================= REGISTRATION FORM FUNCTIONALITY =================
document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.querySelector('#signupForm form');
    
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('❌ Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                alert('❌ Password must be at least 6 characters long');
                return;
            }
            
            try {
                const submitBtn = registrationForm.querySelector('button');
                submitBtn.textContent = 'Creating Account...';
                submitBtn.disabled = true;
                
                const response = await fetch('http://localhost:3001/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Account created successfully! You can now login.');
                    registrationForm.reset();
                    showLogin();
                } else {
                    alert('❌ Error: ' + result.message);
                }
                
            } catch (error) {
                alert('❌ Network error: Could not connect to server.');
            } finally {
                const submitBtn = registrationForm.querySelector('button');
                submitBtn.textContent = 'Create Account';
                submitBtn.disabled = false;
            }
        });
    }
});

// ================= LOGIN FORM FUNCTIONALITY =================
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('#loginForm form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const submitBtn = loginForm.querySelector('button');
                submitBtn.textContent = 'Logging in...';
                submitBtn.disabled = true;
                
                const response = await fetch('http://localhost:3001/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Login successful! Welcome back!');
                    window.location.href = '/app.html';
                } else {
                    alert('❌ ' + result.message);
                }
                
            } catch (error) {
                alert('❌ Network error: Could not connect to server.');
            } finally {
                const submitBtn = loginForm.querySelector('button');
                submitBtn.textContent = 'Login to Cipher';
                submitBtn.disabled = false;
            }
        });
    }
});

// ================= REAL-TIME CHAT FUNCTIONALITY =================
const socket = io();

function initChat() {
    const chatHTML = `
        <div class="chat-container">
            <div class="chat-header">
                <h3>💬 Live Chat</h3>
                <span class="online-count">1 online</span>
            </div>
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input-container">
                <input type="text" id="chatInput" placeholder="Type a message...">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>
    `;
    
    document.body.innerHTML += chatHTML;
    setupChatEvents();
}

function setupChatEvents() {
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        socket.emit('send-message', {
            text: message,
            user: 'You',
            time: new Date().toLocaleTimeString()
        });
        
        addMessageToChat(message, 'You', true);
        input.value = '';
    }
}

function addMessageToChat(text, user, isLocal = false) {
    const chatBox = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isLocal ? 'local' : 'remote'}`;
    messageDiv.innerHTML = `
        <strong>${user}:</strong> ${text}
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
    `;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

socket.on('receive-message', (data) => {
    addMessageToChat(data.text, data.user, false);
});

// Initialize chat when page loads
setTimeout(initChat, 1000);
