var React = require('react'),
    Events = require('../Events'),
    EditableButton = require('./EditableButton'),

    //TODO extract nick into separate component
    socket = require('./SocketManager');

module.exports = React.createClass({
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
      socket.emit(Events.NICK, nick);
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
