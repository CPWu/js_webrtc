# js_webrtc

This repository will build a 1-to-1 video chat, where each peer streams directly to the other peer, there is no need for a intermediary server to handle video content. However, a 3rd party server is required for signalling that stores shared data for stream negotiation. We will be using Firestore because it is easy to listen to u pdates to the database in realtime.

## How WebRTC Works

### Peer 1
1. Start a webcam feed
2. Create a "RTPeerConnection" connection
3. Call 'createOffer()' generates the offer in the textbox.
4. Copy the offer to the opposing browser and paste it into the SDP offer textbox.
 Share ICE candidates with one peer
6. Paste answer to SDP Answer and create Add Answer.
7. Both video feeds should now be live.

### Peer 2
1. Start a webcam feed
2. Create an 'RTCPeerConnection' connection
5. Create an answer SDP off of Peer #1s SDP. Copy the SDP answer and paste back into browser #1
