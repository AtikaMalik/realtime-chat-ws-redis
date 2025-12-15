/*
  socket-client.js
  - Creates socket connection and exposes a small helper API.
  - This file runs in the browser and expects /socket.io/socket.io.js to be loaded first.
*/

/* eslint-disable no-unused-vars */
(function () {
  // default: connect to same host + port (works when server serves index.html)
  // If your server is at a different origin, put the full URL: io("http://localhost:3000")
  const socket = io();

  // expose for other scripts (simple approach if not using modules)
  window.socket = socket;

  // small helper: send typed message object
  window.sendMessageToServer = (text) => {
    socket.emit('chat_message', { text: String(text) });
  };

  // Optionally you can listen to connection events
  socket.on('connect', () => {
    console.log('socket connected', socket.id);
  });
  socket.on('disconnect', (reason) => {
    console.log('socket disconnected', reason);
  });

  // You may want to expose ability to set your username (emit to server)
  window.setMyName = (name) => {
    socket.emit('set_name', { name: String(name) });
  };
})();
