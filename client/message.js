const socket = window.io();

export const sendMessage = (type, payload) => socket.emit('message', {type, payload})
export const onMessage = (type, callback) => socket.on('message', message => message.type === type && callback(message.payload))



