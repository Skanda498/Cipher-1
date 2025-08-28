#!/bin/bash
# Start a simple Node.js server to show Sign Up & Log In page

# Ensure we are in the Cipher-1 directory
cd ~/Cipher-1

# Create public folder if not exists
mkdir -p public

# Write a simple index.html with sign up and log in form
cat > public/index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sign Up / Log In - Cipher</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      width: 300px;
    }
    h2 {
      text-align: center;
    }
    input {
      width: 100%;
      padding: 10px;
      margin: 8px 0;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    button {
      width: 100%;
      padding: 10px;
      background: #e63946;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background: #c1121f;
    }
    .toggle {
      text-align: center;
      margin-top: 15px;
    }
    .toggle a {
      color: #0077b6;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 id="formTitle">Sign Up</h2>
    <form id="authForm">
      <input type="text" id="username" placeholder="Username" required>
      <input type="password" id="password" placeholder="Password" required>
      <button type="submit">Submit</button>
    </form>
    <div class="toggle">
      <p id="toggleText">Already have an account? <a onclick="toggleForm()">Log In</a></p>
    </div>
  </div>

  <script>
    let isSignUp = true;
    function toggleForm() {
      isSignUp = !isSignUp;
      document.getElementById("formTitle").innerText = isSignUp ? "Sign Up" : "Log In";
      document.getElementById("toggleText").innerHTML =
        isSignUp ? 'Already have an account? <a onclick="toggleForm()">Log In</a>' :
                   'Don\'t have an account? <a onclick="toggleForm()">Sign Up</a>';
    }

    document.getElementById("authForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const user = document.getElementById("username").value;
      const pass = document.getElementById("password").value;
      alert((isSignUp ? "Signed Up" : "Logged In") + " with Username: " + user);
    });
  </script>
</body>
</html>
EOF

# Start Node.js server
cat > server.js <<'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  let extname = String(path.extname(filePath)).toLowerCase();
  let contentType = 'text/html';

  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif'
  };

  contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('404 - File Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
EOF

# Run the server
node server.js
