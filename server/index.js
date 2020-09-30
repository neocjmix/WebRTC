const static = require('node-static');
const http = require('http');
const socketIO = require('socket.io');

// client 파일들을 같은 서버에서 서빙한다.
const file = new static.Server('../client');
const app = http
  .createServer(file.serve.bind(file))
  .listen(3000);

// 모든 클라이언트에서 발송된 메시지를 다른 모든 클라이언트에게 무차별적으로 전송한다.
socketIO
  .listen(app).sockets
  .on('connection', socket => (
    socket.on('message', message => socket.broadcast.emit('message', message))
  ));
