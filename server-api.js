const http = require('http');
const url = require('url');
const querystring = require('querystring');
const db = require('./database');

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url);
    const path = parsedUrl.pathname;
    
    // Set CORS headers to allow frontend communication
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Handle registration
    if (path === '/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { email, password } = querystring.parse(body);
                const user = await db.createUser(email, password);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'User created successfully!',
                    user: { email: user.email, id: user.id }
                }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: error.message 
                }));
            }
        });
    }
    
    // Handle login
    else if (path === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { email, password } = querystring.parse(body);
                const isValid = await db.verifyUser(email, password);
                
                if (isValid) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: 'Login successful!',
                        user: { email: email }
                    }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Invalid email or password' 
                    }));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Server error during login' 
                }));
            }
        });
    }
    
    // Handle other routes
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Endpoint not found' }));
    }
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ API Server running on http://localhost:${PORT}`);
});
