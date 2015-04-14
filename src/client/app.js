var React = require('react'),
    io = require('socket.io-client');

var Chat = React.createClass({
  render: function() {
    return (
      <div className="chat">
        <span className="chat__author">
          {this.props.author}
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
        <Chat author={chat.author}>
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

var ChatBox = React.createClass({
  getInitialState: function() {
    return {chats: []};
  },
  componentDidMount: function() {
    this.socket = io(':3000', {query: 'room=' + this.props.room});
    this.socket.on('connect', function() {
      log(this.props.room, 'connected');
    }.bind(this));
    this.socket.on('chat', function(msg) {
      log(this.props.room, 'received message');
      var oldChats = this.state.chats;
      var newChats = oldChats.concat(msg);
      this.setState({chats: newChats});
    }.bind(this));
  },
  onMessageSubmit: function(chat) {
    log(this.props.room, 'sending message');
    this.socket.emit('chat', {author: 'user', message: chat.message});
  },
  render: function() {
    return (
      <div className="chatBox">
        Hello
        <ChatList chats={this.state.chats}/>
        <ChatInput onMessageSubmit={this.onMessageSubmit} />
      </div>
    );
  }
});

React.render(
  <ChatBox room="boo" />,
  document.getElementById('app')
);
