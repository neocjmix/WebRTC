const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
const connectButton = document.getElementById('connectButton')
const socket = window.io('//192.168.0.6:3000');
const rtcPeerConnection = new RTCPeerConnection();

rtcPeerConnection.onicecandidate = e => {
  if (e.candidate === null) return;
  socket.emit('message', {
    type: 'new-ice-candidate',
    payload: e.candidate,
  })
};

rtcPeerConnection.onaddstream = e => {
  remoteVideo.srcObject = e.stream;
}

connectButton.addEventListener('click', async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    localVideo.srcObject = mediaStream;
    await rtcPeerConnection.addStream(mediaStream);

    await new Promise(resolve => rtcPeerConnection.onnegotiationneeded = resolve);
    const rtcSessionDescriptionInit = await rtcPeerConnection.createOffer();
    await rtcPeerConnection.setLocalDescription(rtcSessionDescriptionInit);
    socket.emit('message', {
      type: 'video-offer',
      payload: rtcSessionDescriptionInit,
    })

    socket.on('message', async message => {
      switch (message.type) {
        case 'video-answer':
          const rtcSessionDescription = new RTCSessionDescription(message.payload);
          await rtcPeerConnection.setRemoteDescription(rtcSessionDescription);
          break;

        case 'new-ice-candidate':
          await rtcPeerConnection.addIceCandidate(new RTCIceCandidate(message.payload))
          break;
      }
    })
  }
)
