cat > ~/Cipher-1-test/public/js/webrtc.js << 'EOF'
// WebRTC functionality implementation
class WebRTCManager {
    constructor(socket) {
        this.socket = socket;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.isCaller = false;
        this.currentCall = null;
        
        this.initializeMediaElements();
        this.setupEventListeners();
    }

    initializeMediaElements() {
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.videoCallContainer = document.getElementById('videoCallContainer');
        this.incomingCallModal = document.getElementById('incomingCallModal');
        this.audioCallBtn = document.getElementById('audioCallBtn');
        this.videoCallBtn = document.getElementById('videoCallBtn');
        this.endCallBtn = document.getElementById('endCallBtn');
        this.answerCallBtn = document.getElementById('answerCallBtn');
        this.rejectCallBtn = document.getElementById('rejectCallBtn');
    }

    setupEventListeners() {
        // Audio call button
        this.audioCallBtn.addEventListener('click', () => {
            this.initiateCall(false);
        });

        // Video call button
        this.videoCallBtn.addEventListener('click', () => {
            this.initiateCall(true);
        });

        // End call button
        this.endCallBtn.addEventListener('click', () => {
            this.endCall();
        });

        // Answer call button
        this.answerCallBtn.addEventListener('click', () => {
            this.answerCall();
        });

        // Reject call button
        this.rejectCallBtn.addEventListener('click', () => {
            this.rejectCall();
        });

        // WebRTC signaling events
        this.socket.on('callMade', async (data) => {
            this.currentCall = data;
            this.showIncomingCall(data);
        });

        this.socket.on('offer', async (data) => {
            if (this.peerConnection) {
                await this.peerConnection.setRemoteDescription(data.offer);
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                this.socket.emit('answer', {
                    answer: answer,
                    target: data.sender
                });
            }
        });

        this.socket.on('answer', async (data) => {
            if (this.peerConnection) {
                await this.peerConnection.setRemoteDescription(data.answer);
            }
        });

        this.socket.on('ice-candidate', async (data) => {
            if (this.peerConnection) {
                await this.peerConnection.addIceCandidate(data.candidate);
            }
        });

        this.socket.on('callEnded', () => {
            this.endCall();
        });

        this.socket.on('callRejected', () => {
            alert('Call was rejected');
            this.hideIncomingCall();
            this.resetCall();
        });
    }

    async initiateCall(isVideo) {
        try {
            this.isCaller = true;
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: isVideo,
                audio: true
            });
            
            this.localVideo.srcObject = this.localStream;
            this.createPeerConnection();
            
            // For demo purposes, we'll target a specific user
            // In a real app, you'd have a user selection mechanism
            const targetUserId = 'demo-user-id';
            
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            this.socket.emit('callUser', {
                offer: offer,
                target: targetUserId,
                isVideo: isVideo
            });
            
            this.showCallInterface();
            
        } catch (error) {
            console.error('Error initiating call:', error);
            alert('Could not start call. Please check your camera and microphone permissions.');
            this.resetCall();
        }
    }

    async answerCall() {
        try {
            this.hideIncomingCall();
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: this.currentCall.isVideo,
                audio: true
            });
            
            this.localVideo.srcObject = this.localStream;
            this.createPeerConnection();
            
            await this.peerConnection.setRemoteDescription(this.currentCall.offer);
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            this.socket.emit('answer', {
                answer: answer,
                target: this.currentCall.sender
            });
            
            this.showCallInterface();
            
        } catch (error) {
            console.error('Error answering call:', error);
            this.resetCall();
        }
    }

    rejectCall() {
        this.socket.emit('rejectCall', {
            target: this.currentCall.sender
        });
        this.hideIncomingCall();
        this.resetCall();
    }

    endCall() {
        if (this.currentCall && this.isCaller) {
            this.socket.emit('endCall', {
                target: this.currentCall.sender
            });
        }
        
        this.resetCall();
        this.hideCallInterface();
    }

    createPeerConnection() {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        this.peerConnection = new RTCPeerConnection(configuration);
        
        // Add local stream to connection
        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });
        
        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            this.remoteVideo.srcObject = this.remoteStream;
        };
        
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    target: this.isCaller ? this.currentCall.target : this.currentCall.sender
                });
            }
        };
        
        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            if (this.peerConnection.connectionState === 'disconnected' ||
                this.peerConnection.connectionState === 'failed') {
                this.endCall();
            }
        };
    }

    showIncomingCall(data) {
        const callerName = data.username || 'Unknown';
        document.getElementById('callerName').textContent = `${callerName} is calling...`;
        this.incomingCallModal.style.display = 'flex';
    }

    hideIncomingCall() {
        this.incomingCallModal.style.display = 'none';
    }

    showCallInterface() {
        this.videoCallContainer.style.display = 'flex';
    }

    hideCallInterface() {
        this.videoCallContainer.style.display = 'none';
    }

    resetCall() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;
        this.isCaller = false;
        this.currentCall = null;
    }
}

// Initialize WebRTC manager when socket is available
let webrtcManager;
socket.on('connect', () => {
    webrtcManager = new WebRTCManager(socket);
});
EOF
