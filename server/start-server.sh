#!/data/data/com.termux/files/usr/bin/bash

# Navigate to the project directory
cd ~/Cipher-1/server

# Kill any node server already running on port 3000
fuser -k 3000/tcp 2>/dev/null

# Start the Cipher server in the background
nohup node server.js > server.log 2>&1 &

# Wait a few seconds to make sure the server is up
sleep 5

# Kill any previous cloudflared tunnel
pkill -f "cloudflared tunnel" 2>/dev/null

# Start a new quick Cloudflare tunnel in the background
nohup cloudflared tunnel --url http://localhost:3000 > cloudflared.log 2>&1 &

# Wait a few seconds for the tunnel to initialize
sleep 5

# Extract the tunnel URL and save it to public_url.txt
grep "trycloudflare.com" cloudflared.log | awk '{print $NF}' > public_url.txt

# Display the URL
echo "Your public URL is:"
cat public_url.txt
