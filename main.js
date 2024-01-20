// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import 'firebase/firestore'
import firebase from 'firebase/app'
import './style.css'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANOvCns6pMinKSIKn1NFrN4btEmgGeAVA",
  authDomain: "jswebrtc-d6e84.firebaseapp.com",
  projectId: "jswebrtc-d6e84",
  storageBucket: "jswebrtc-d6e84.appspot.com",
  messagingSenderId: "123551634511",
  appId: "1:123551634511:web:8d53ef4855c76c1dcfc63a",
  measurementId: "G-QY0GP144V9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = firebase.firestore();

// Adds the STUN server, where the data transfer.
// Free iceServers from Google.
const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'], // free stun server
      },
    ],
    iceCandidatePoolSize: 10,
};

const peerConnection = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// Access Elements in HTML using Document Object Model (DOM)
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');

webcamButton.onclick = async () => {

    // setting local stream to the video from our camera
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    })

    // initalizing the remote server to the mediastream
    remoteStream = new MediaStream();


    // Pushing tracks from local stream to peerConnection
    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    })

    pc.ontrack = event => {
        event.streams[0].getTracks(track => {
            remoteStream.addTrack(track)
        })
    }  

    // displaying the video data from the stream to the webpage
    webcamVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;

    // enabling and disabling interface based on the current condtion
    callButton.disabled = false;
    answerButton.disabled = false;
    webcamButton.disabled = true;
}

callButton.onclick = async () => {

    // referencing firebase collections
    const callDoc = firestore.collection('calls').doc();
    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidiates = callDoc.collection('answerCandidates');

    // setting the input value to the calldoc id
    callInput.value = callDoc.id;

    // get candidiates for caller and save to db
    pc.onicecandidate = event => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
    }

    // create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    // config for offer
    const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type
    }

    await callDoc.set({offer});

    
    // listening to changes in firestore and update the streams accordingly

    callDoc.onSnapshot(snapshot => {
        const data = snapshot.data();

        if (!pc.currentRemoteDescription && data.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.setRemoteDescription(answerDescription);
        }

        // if answered add candidates to peer connection
        answerCandidiates.onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {

                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.addIceCandidate(candidate);
                }
            })
        })
    })

    hangupButton.disabled = false;

}

answerButton.onclick = async () => {
    const callId = callInput.value;
  
    // getting the data for this particular call
    const callDoc = firestore.collection('calls').doc(callId); 
                    
    const answerCandidates = callDoc.collection('answerCandidates');
    const offerCandidates = callDoc.collection('offerCandidates');

    // here we listen to the changes and add it to the answerCandidates
    pc.onicecandidate = event => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());

    }

    const callData = (await callDoc.get()).data();

    // setting the remote video with offerDescription
    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
    

    // setting the local video as the answer
    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(new RTCSessionDescription(answerDescription));

    // answer config
    const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp
    }

    await callDoc.update({ answer });

    offerCandidates.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {

            if (change.type === 'added') {
                let data = change.doc.data();
                pc.addIceCandidate(new RTCIceCandidate(data));

            }
        })
    })
}