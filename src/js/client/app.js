var React = require('react'),
    io = require('socket.io-client'),
    crypto = require('crypto');

var socket = io(':3000');

// REMOVE - expose socket for debugging
window.socket = socket;

var Chat = React.createClass({
  render: function() {
    return (
      <div className="chat">
        <span className="chat__user">
          {this.props.user}
        </span>
        <p className="chat__message">{this.props.children.toString()}</p>
      </div>
    );
  }
});

var ChatList = React.createClass({
  render: function() {
    var chatNodes = this.props.chats.map(function (chat) {
      return (
        <Chat user={chat.user}>
          {chat.message}
        </Chat>
      );
    });
    return (
      <div className="chatList">
        {chatNodes}
      </div>
    );
  }
});

var ChatInput = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var message = React.findDOMNode(this.refs.message).value.trim();
    if (!message) { return; }
    this.props.onMessageSubmit({message: message});
    React.findDOMNode(this.refs.message).value = '';
    return;
  },
  render: function() {
    return (
      <form className="chatInput" onSubmit={this.handleSubmit}>
        <input id="in" className="chatInput__message" type="text" ref="message" />
      </form>
    );
  }
});

function log(tag, msg) {
  console.log('[' + tag + ']: ' + msg);
}

function randomNick(n) {
  return 'user' + crypto.randomBytes(Math.ceil(n/2))
               .toString('hex')
               .slice(0, n);
}


var ChatBox = React.createClass({
  getInitialState: function() {
    console.log('joined');

    socket.on('chat', function(message) {
      var oldChats = this.state.chats;
      var newChats = oldChats.concat(message);
      this.setState({chats: newChats});
    }.bind(this));

    socket.on('nick', function(nick) {
      this.setState({nick: nick});
    }.bind(this));

    socket.on('event', function(event) {
      var message;
      switch(event.type) {
      case 'join':
        message = event.user + ' joined ' + event.room;
        break;
      case 'leave':
        message = event.user + ' left ' + event.room;
        break;
      case 'error':
        message = event.error;
        break;
      default:
        message = 'undefined event received: ' + event.toString();
        break;
      }
      message = {user: 'server',
                 message: message};
      var oldChats = this.state.chats;
      var newChats = oldChats.concat(message);
      this.setState({chats: newChats});
    }.bind(this));
    
    return {nick: "",
            chats: []};
  },
  componentDidMount: function() {
    socket.emit('join', this.props.room);
  },
  onMessageSubmit: function(chat) {
    socket.emit('chat', {room: this.props.room,
                         message: chat.message});
  },
  render: function() {
    return (
      <div className="chatBox">
        Hello
        <ChatList chats={this.state.chats}/>
        <p>{this.state.nick}</p>
        <ChatInput onMessageSubmit={this.onMessageSubmit} />
      </div>
    );
  }
});

React.render(
  <ChatBox room="boo" />,
  document.getElementById('app')
);
