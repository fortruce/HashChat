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
    
    if (!message)
      return;

    this.props.onMessageSubmit({message: message});

    React.findDOMNode(this.refs.message).value = '';
    return;
  },

  render: function() {
    return (
      <form className="chatInput" onSubmit={this.handleSubmit}>
        <EditableButton initialText="test" />
        <a href="#" className="chatInput__nick">{this.props.nick}</a>
        <input id="in" className="chatInput__message" type="text" ref="message" />
      </form>
    );
  }
});

var EditableButton = React.createClass({
  getInitialState: function() {
    return {editing: false,
            text: this.props.initialText};
  },
  toggleEditing: function() {
    console.log('toggleEditing');
    this.setState({editing: true});
  },
  handleChange: function(e) {
    console.log('handleChange');
    if (e.target.value.length > 16)
      return;
    this.setState({text: e.target.value});
  },
  handleKey: function(e) {
    console.log('handleKey');
    var key = e.keyCode || e.which;
    if (key === 13) {
      // prevent bubbling up - was calling button's onclick
      // and keeping editing enabled
      e.preventDefault();
      this.setState({editing: false});
    }
  },
  render: function() {
    var inputClass = this.state.editing ? "" : "hidden";
    var buttonClass = this.state.editing ? "hidden" : "";

    return (
      <div className="editableButton">
    <input onChange={this.handleChange}
           onKeyPress={this.handleKey}
           type="text" ref="in"
           value={this.state.text} className={inputClass} />
      <button onClick={this.toggleEditing}
              className={buttonClass}>
      {this.state.text}
    </button>
        </div>
    );
  }
});

var ChatBox = React.createClass({
  addMessage: function(message) {
    var oldChats = this.state.chats;
    var newChats = oldChats.concat(message);
    this.setState({chats: newChats});
  },
  getInitialState: function() {
    socket.on('chat', function(message) {
      // ignore if message not meant for this room
      if (message.room !== true &&
          message.room !== this.props.room)
        return;
      
      this.addMessage(message);
    }.bind(this));

    socket.on('nick', function(nick) {
      this.setState({nick: nick});
    }.bind(this));

    socket.on('server', function(message) {
      this.addMessage({user: 'server',
                       message: message});
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
        <ChatList chats={this.state.chats}/>
        <ChatInput nick={this.state.nick} onMessageSubmit={this.onMessageSubmit} />
      </div>
    );
  }
});

React.render(
  <ChatBox room="boo" />,
  document.getElementById('app')
);
