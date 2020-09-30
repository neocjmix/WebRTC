import {onMessage, sendMessage} from "./message.js";

const callButton = document.getElementById('call');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const rtcPeerConnection = new RTCPeerConnection();

const sendSdpOffer = async () => {
  const rtcSessionDescriptionInit = await rtcPeerConnection.createOffer();
  await rtcPeerConnection.setLocalDescription(rtcSessionDescriptionInit);
  sendMessage('SDP', rtcSessionDescriptionInit)
};

const sendSdpAnswer = async () => {
  const rtcSessionDescriptionInit = await rtcPeerConnection.createAnswer();
  await rtcPeerConnection.setLocalDescription(rtcSessionDescriptionInit);
  sendMessage('SDP', rtcSessionDescriptionInit);
};

navigator.mediaDevices
  .getUserMedia({video: true, audio: false})
  .then(mediaStream => {
    localVideo.srcObject = mediaStream;
    mediaStream.getTracks().forEach(track => rtcPeerConnection.addTrack(track));
  });

// exchange SDP
rtcPeerConnection.addEventListener('negotiationneeded', () => callButton.disabled = false)
callButton.addEventListener('click', sendSdpOffer)
onMessage('SDP', async descriptionInit => {
  const rtcSessionDescription = new RTCSessionDescription(descriptionInit);
  await rtcPeerConnection.setRemoteDescription(rtcSessionDescription);
  if (descriptionInit.type === 'offer') {
    callButton.disabled = true
    await sendSdpAnswer();
  }
})

// exchange ICE
rtcPeerConnection.addEventListener('icecandidate', e => e.candidate == null || sendMessage('ICE', e.candidate));
onMessage('ICE', candidateInit => rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidateInit)))

// handle remote stream
rtcPeerConnection.addEventListener('track', e => remoteVideo.srcObject = new MediaStream([e.track]));
