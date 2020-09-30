import {sendMessage, onMessage} from "./message.js";  // 추가

(async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  document.getElementById('localVideo').srcObject = mediaStream;

  const rtcPeerConnection = new RTCPeerConnection();
  mediaStream.getTracks().forEach(track => rtcPeerConnection.addTrack(track));

  rtcPeerConnection.addEventListener('negotiationneeded', async () => {
    const sdpOffer = await rtcPeerConnection.createOffer();
    rtcPeerConnection.setLocalDescription(sdpOffer);
    sendMessage('SDP', sdpOffer)
  });

  onMessage('SDP', sdpAnswer => rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(sdpAnswer)));

  rtcPeerConnection.addEventListener('track', e => {
    document.getElementById('remoteVideo').srcObject = new MediaStream([e.track])
  });

  rtcPeerConnection.addEventListener('icecandidate', e => {
    if (e.candidate === null) return;
    sendMessage('ICE', e.candidate)
  });

  onMessage('ICE', iceCandidate => {
    rtcPeerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
  })
})();
