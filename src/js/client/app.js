var React = require('react/addons'),
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

var ChatBox = React.createClass({
  render: function() {
    var chatNodes = this.props.messages.map(function (message) {
      return (
        <Chat user={message.user}>
          {message.message}
        </Chat>
      );
    });
    return (
      <div className="chatBox">
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
    if (e.target.value.length <= this.props.maxLength)
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
  addMessage: function(message) {
    this.setState(function(pState) {
      var room = message.room ? message.room : this.state.active;
      var messages = React.addons.update(pState.rooms[room],
                                         {$push: [message]});
      var newRoom = {};
      newRoom[room] = messages;
      var newRooms = React.addons.update(pState.rooms,
                                         {$merge: newRoom});
      return {rooms: newRooms};
    });
  },
  getInitialState: function() {
    socket.on('chat', function(message) {
      this.addMessage(message);
    }.bind(this));

    socket.on('nick', function(nick) {
      this.setState({nick: nick});
    }.bind(this));

    socket.on('server', function(event) {
      var message = event.message;
      if (typeof event == 'string' || event instanceof String)
        message = event;

      this.addMessage({user: 'server',
                       message: message});
    }.bind(this));
        
    return {active: 'general',
            nick: '',
            rooms: {'general': []}};
  },
  componentDidMount: function() {
    socket.emit('join', this.state.active);
  },
  onMessageSubmit: function(message) {
    socket.emit('chat', {room: this.state.active,
                         message: message.message});
  },
  changeRoom: function(room) {
    if (this.state.rooms[room]) {
      this.setState({active: room});
      return;
    }

    socket.emit('join', room);
    
    var newRoom = {[room]: []};

    var newRooms = React.addons.update(this.state.rooms,
                                       {$merge: newRoom});
    this.setState({rooms: newRooms,
                  active: room});
  },
  render: function() {
    var messages = this.state.rooms[this.state.active];
    return (
      <div className="chatContainer">
        <EditableButton text={this.state.active}
                        maxLength={20}
                        onChange={this.changeRoom} />
        <ChatBox messages={messages} />
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
