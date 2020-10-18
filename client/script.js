import {getConnectionId, onMessage, sendMessage} from "./message.js";

const localConnectionId = document.getElementById('localConnectionId');
const callButton = document.getElementById('call');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const remoteConnectionId = document.getElementById('remoteConnectionId');
const rtcPeerConnection = new RTCPeerConnection();

// 아래 세 메소드는 WebSocket을 통해서 통신하므로
// remoteConnectionId input에 상대방의 connectionID가 입력되어 있어야 한다.
const sendSdpOffer = async () => {
  const rtcSessionDescriptionInit = await rtcPeerConnection.createOffer();
  await rtcPeerConnection.setLocalDescription(rtcSessionDescriptionInit);
  sendMessage(remoteConnectionId.value, 'SDP', rtcSessionDescriptionInit)
};

const sendSdpAnswer = async () => {
  const rtcSessionDescriptionInit = await rtcPeerConnection.createAnswer();
  await rtcPeerConnection.setLocalDescription(rtcSessionDescriptionInit);
  sendMessage(remoteConnectionId.value, 'SDP', rtcSessionDescriptionInit);
};

const sendIceCandidate = candidate => {
  sendMessage(remoteConnectionId.value, 'ICE', candidate);
};

// 자신의 connectionId를 받아서 화면에 표시
getConnectionId().then(connectionId => localConnectionId.value = connectionId);

// 웹캠 화면 가져와 화면에 표시
navigator.mediaDevices
  .getUserMedia({video: true, audio: false})
  .then(mediaStream => {
    localVideo.srcObject = mediaStream;
    mediaStream.getTracks().forEach(track => rtcPeerConnection.addTrack(track));
  });

// SDP offer/answer 교환
rtcPeerConnection.addEventListener('negotiationneeded', () => callButton.disabled = false)
callButton.addEventListener('click', sendSdpOffer)
onMessage('SDP', async (descriptionInit, from) => {
  const rtcSessionDescription = new RTCSessionDescription(descriptionInit);
  await rtcPeerConnection.setRemoteDescription(rtcSessionDescription);
  if (descriptionInit.type === 'offer') {
    remoteConnectionId.value = from;
    callButton.disabled = true
    await sendSdpAnswer();
  }
})


// ICE 후보 교환
rtcPeerConnection.addEventListener('icecandidate', e => e.candidate == null || sendIceCandidate(e.candidate));
onMessage('ICE', candidateInit => rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidateInit)))

// 상대방 화면 표시
rtcPeerConnection.addEventListener('track', e => remoteVideo.srcObject = new MediaStream([e.track]));
