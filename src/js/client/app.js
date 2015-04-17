var React = require('react'),
    socket = require('./SocketManager'),

    //components
    ChatContainer = require('./ChatContainer');

// REMOVE - expose socket for debugging
window.socket = socket;

React.render(
  <ChatContainer />,
  document.getElementById('app')
);
