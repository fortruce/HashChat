var React = require('react'),
    io = require('socket.io-client'),
    crypto = require('crypto');

var socket = io(':3000');

// REMOVE - expose socket for debugging
window.socket = socket;

// create a 6 digit # color code from a string
function stringToColor(s) {
  var hash = 0;
  for (var i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  for (var i = 0, color = '#'; i < 3; i++) {
    color += ('00' + ((hash >> i * 8) & 0xFF).toString(16))
             .slice(-2);
  }
  return color;
}

var Chat = React.createClass({
  render: function() {
    return (
      <div className="chat">
        <div style={{color: stringToColor(this.props.user)}} className="chat__user">
          {this.props.user}
        </div>
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
    var key = e.keyCode || e.which;
    if (key !== 13)
      return;
    
    var message = React.findDOMNode(this.refs.message).value.trim();
    
    if (!message)
      return;

    this.props.onMessageSubmit({message: message});

    React.findDOMNode(this.refs.message).value = '';
    return;
  },
  componentDidMount: function() {
    React.findDOMNode(this.refs.message).focus();
  },
  nickChange: function(nick) {
    if (nick !== this.props.nick)
      socket.emit('nick', nick);
  },
  render: function() {
    return (
      <div className="chatInput" onSubmit={this.handleSubmit}>
        <EditableButton text={this.props.nick}
                        maxLength={16}
                        onChange={this.nickChange} />
        <input id="in" onKeyPress={this.handleSubmit}
               className="chatInput__message" type="text" ref="message" />
      </div>
    );
  }
});

var EditableButton = React.createClass({
  getInitialState: function() {
    return {editing: false,
            text: this.props.text};
  },
  componentWillReceiveProps: function(props) {
    this.setState({text: props.text});
  },
  toggleEditing: function() {
    var e = !this.state.editing;

    // revert input if edited value is not valid
    if (this.state.editing && !this.valid())
      this.setState({editing: e, text: this.props.text});
    
    this.setState({editing: e});
  },
  onChange: function(e) {
    this.setState({text: e.target.value.trim()});
  },
  valid: function() {
    var t = React.findDOMNode(this.refs.input).value.trim();
    return t.length > 0 && t.length <= this.props.maxLength;
  },
  commitEdit: function() {
    this.toggleEditing();

    if (this.valid())
      this.props.onChange(this.state.text);
  },
  onEnter: function(e) {
    var key = e.keyCode || e.which;
    if (key === 13) {
      this.commitEdit();
    }
  },
  onBlur: function(e) {
    if (this.state.editing)
      this.commitEdit();
  },
  componentDidUpdate: function() {
    if (!this.state.editing)
      return;

    var input = React.findDOMNode(this.refs.input);
    if (document.activeElement === input)
      return;

    // refresh value to put cursor at end
    var val = input.value;
    input.value = val;
    input.focus();
  },
  render: function() {
    var styles = this.state.editing ? [{}, {display: 'none'}] :
                                      [{display: 'none'}, {}];
    
    return (
      <div className="editableButton">
       <button onClick={this.toggleEditing}
               style={styles[1]}>
         {this.state.text}
       </button>
       <input onBlur={this.onBlur}
              onChange={this.onChange}
              onKeyPress={this.onEnter}
              style={styles[0]}
              type="text" ref="input"
              value={this.state.text}  />
      </div>
    );
  }
});

var ChatContainer = React.createClass({
  getInitialState: function() {
    return {room: 'general'}
  },
  handleRoomChange: function(room) {
    socket.emit('join', room);
    this.setState({room: room});
  },
  render: function() {
    return (
      <div>
        <EditableButton text={this.state.room}
                        maxLength={20}
                        onChange={this.handleRoomChange} />
        <ChatBox room={this.state.room} />
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

    socket.on('server', function(event) {
      var message = event.message;
      if (typeof event == 'string' || event instanceof String)
        message = event;
      
      if (event.room && event.room !== this.props.room)
        return;
      
      this.addMessage({user: 'server',
                       message: event.message});
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
        <ChatInput nick={this.state.nick}
                   onMessageSubmit={this.onMessageSubmit} />
      </div>
    );
  }
});

React.render(
  <ChatContainer />,
  document.getElementById('app')
);
