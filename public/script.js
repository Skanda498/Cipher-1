// -----------------------
// Cipher 1 – Audio Call + Chat Script
// -----------------------

// Elements
const startCallBtn = document.getElementById('startCall');
const endCallBtn = document.getElementById('endCall');
const muteAudioBtn = document.getElementById('muteAudio');
const muteVideoBtn = document.getElementById('muteVideo');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.getElementById('chatContainer');

let localStream;
let peerConnection;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// -----------------------
// Start Call
// -----------------------
startCallBtn.addEventListener('click', async () => {
    startCallBtn.disabled = true;
    endCallBtn.disabled = false;

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        // Create peer connection
        peerConnection = new RTCPeerConnection(config);

        // Add local tracks
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Receive remote stream
        peerConnection.ontrack = event => {
            remoteVideo.srcObject = event.streams[0];
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log('New ICE candidate:', event.candidate);
                // Normally send candidate to remote peer via signaling server
            }
        };

        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log('Call started: offer created');
    } catch (err) {
        alert('Error accessing media devices: ' + err.message);
    }
});

// -----------------------
// End Call
// -----------------------
endCallBtn.addEventListener('click', () => {
    peerConnection?.close();
    localStream?.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    startCallBtn.disabled = false;
    endCallBtn.disabled = true;
    console.log('Call ended');
});

// -----------------------
// Mute Audio / Video
// -----------------------
muteAudioBtn.addEventListener('click', () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    muteAudioBtn.textContent = audioTrack.enabled ? 'Mute Audio' : 'Unmute Audio';
});

muteVideoBtn.addEventListener('click', () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    muteVideoBtn.textContent = videoTrack.enabled ? 'Mute Video' : 'Unmute Video';
});

// -----------------------
// Chat Feature
// -----------------------
sendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (!message) return;

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', 'self');
    msgDiv.textContent = 'You: ' + message;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    chatInput.value = '';

    // Here you can add WebRTC DataChannel or server call to send message
});

// Allow Enter key to send chat
chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendBtn.click();
});
