const API_ID = `j2wt0t4ra7`;
const REGION = `ap-northeast-2`;
const STAGE = `production`;

const WEB_SOCKET_API_URL = `wss://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE}/`;
const socket = new WebSocket(WEB_SOCKET_API_URL);

export const waitForConnected = new Promise(resolve => socket.addEventListener('open', resolve));

export const sendMessage = async (connectionId, type, payload) => {
  await waitForConnected;
  socket.send(JSON.stringify({
    connectionId,
    message: {
      type,
      payload
    }
  }));
};

export const onMessage = (type, callback) => socket.addEventListener('message', e => {
  const {message, from} = JSON.parse(e.data);
  if(message == null) return;
  if(message.type === type) callback(message.payload, from); // 메시지, 상대방의 connectionId를 callback으로 넘겨준다.
});

export const getConnectionId = async () => {
  await waitForConnected;

  //아무 메시지나 보내서 응답에 있는 connectionId를 promise로 넘겨준다.
  socket.send('');
  return new Promise(resolve => {
    socket.addEventListener('message', e => resolve(JSON.parse(e.data).connectionId), {once: true});
  });
};
