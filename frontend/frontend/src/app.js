/* app.js
   - Handles UI interactions: send button, Enter key, add messages, online users, autoscroll, toggle users.
   - Assumes window.socket and window.sendMessageToServer exist (from socket-client.js).
*/

(function () {
  const socket = window.socket;
  if (!socket) {
    console.error('Socket not found. Make sure /socket.io/socket.io.js and socket-client.js are loaded.');
  }
  let myName = prompt("Enter your name") || "Atika";
  if (window.setMyName) {
  window.setMyName(myName);
  }

  // DOM refs
  const input = document.getElementById('msgInput');
  const messagesDiv = document.getElementById('messages');
  const sendBtn = document.getElementById('sendBtn');
  const onlineUsersEl = document.getElementById('onlineUsers');
  const toggleUsersBtn = document.getElementById('toggleUsersBtn');
  const usersPanel = document.getElementById('usersPanel');

  // Helper: safe append a message node
  function addMessageToUI({ user = 'Anon', text = '', id = '', ts = Date.now(), me = false }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message' + (me ? ' me' : '');
    wrapper.setAttribute('data-id', id);

    // meta (name + time)
    const meta = document.createElement('span');
    meta.className = 'msg-meta';
    const time = new Date(ts);
    meta.textContent = `${user} • ${time.toLocaleTimeString()}`;

    // content - use textContent to avoid XSS
    const content = document.createElement('div');
    content.className = 'msg-text';
    content.textContent = String(text);

    wrapper.appendChild(meta);
    wrapper.appendChild(content);
    messagesDiv.appendChild(wrapper);

    // auto-scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Update online users
  function updateOnlineUsers(users = []) {
    onlineUsersEl.innerHTML = '';
    users.forEach(u => {
      const li = document.createElement('li');
      li.textContent = u.name || u; // support user objects or strings
      onlineUsersEl.appendChild(li);
    });
  }

  // Send message (from UI)
  function sendMessageFromUI() {
    const text = input.value.trim();
    if (!text) return;
    // show optimistic UI if desired (mark as me)
    addMessageToUI({ user: myName , text, me: true, ts: Date.now() });
    // emit to server
    if (window.sendMessageToServer) {
      window.sendMessageToServer(text);
    } else if (socket) {
      socket.emit('chat_message', { text });
    }
    input.value = '';
    input.focus();
  }

  // events
  sendBtn.addEventListener('click', sendMessageFromUI);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessageFromUI();
    } else if (e.key === 'Escape') {
      input.value = '';
    }
  });

  // Small UI: toggle users panel on small screens
  toggleUsersBtn.addEventListener('click', () => {
    const isOpen = usersPanel.classList.toggle('open');
    toggleUsersBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Socket listeners (server events)
  if (socket) {
    // Incoming chat messages from server
    socket.on('chat_message', (payload) => {
      // payload expected: { id, user, text, ts }
      addMessageToUI({
        id: payload.id || '',
        user: payload.user || 'Anon',
        text: payload.text || '',
        ts: payload.ts || Date.now(),
        me: false
      });
    });

    // online users list
    socket.on('online_users', (users) => {
      updateOnlineUsers(users || []);
    });

    // Optional: server acknowledges a message you sent (use to adjust optimistic UI)
    socket.on('message_ack', (ack) => {
      // Example: ack = { tempText, id, ts }
      // Could update last optimistic message with the real id/time — left as exercise
      console.log('server ack', ack);
    });
  }

  // simple: focus input on load
  window.addEventListener('load', () => input && input.focus());
})();
