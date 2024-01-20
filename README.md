# js_webrtc

This repository will build a 1-to-1 video chat, where each peer streams directly to the other peer, there is no need for a intermediary server to handle video content. However, a 3rd party server is required for signalling that stores shared data for stream negotiation. We will be using Firestore because it is easy to listen to u pdates to the database in realtime.

## How WebRTC Works

### Peer 1
1. Start a webcam feed
2. Create a "RTPeerConnection" connection
3. CAll 'createOffer()' and write the offer to the database.
4. Listen to the database for an answer
5. Share ICE candidates with one peer
6. Show remote video feed.

### Peer 2
1. Start a webcam feed
2. Create an 'RTCPeerConnection' connection
3. Fetch database document with the offer.
4. Call `createAnswer()`, then write to database.
5. Share ICE candidates with other peer.
6. Show remote video feed.

