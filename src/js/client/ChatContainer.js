var React = require('react'),
    socket = require('./SocketManager'),
    Events = require('../Events'),
    MessageStore = require('./MessageStore'),

    Tabs = require('./Tabs'),
    Nick = require('./Nick'),
    EditableButton = require('./EditableButton'),
    MessageList = require('./MessageList'),
    MessageInput = require('./MessageInput');

module.exports = React.createClass({
  getInitialState: function() {
    return {active: 'general',
            nick: '',
            messages: MessageStore.getAll()};
  },
  componentDidMount: function() {
    // join general room
    socket.emit(Events.JOIN, this.state.active);

    // register listeners
    MessageStore.addChangeListener(this._onChange);
    socket.on(Events.NICK, this._onNick);
  },
  onMessageSubmit: function(message) {
    socket.emit(Events.MESSAGE, {room: this.state.active,
                                 message: message.message});
  },
  componentWillUnmount: function() {
    MessageStore.removeChangeListener(this._onChange);
    socket.removeListener(Events.NICK, this._onNick);
  },
  render: function() {
    var messages = MessageStore.getMessages(this.state.active);
    return (
      <div className="chatContainer">
        <Tabs tabs={MessageStore.rooms()}
              active={this.state.active}
              onAdd={this._addTab}
              onActivate={this._activateTab} />
        <MessageList messages={messages} />

        <div className="inputBar">
          <Nick nick={this.state.nick} />
          <MessageInput onMessageSubmit={this.onMessageSubmit} />
        </div>
      </div>
    );
  },
  _addTab: function(room) {
    socket.emit(Events.JOIN, room);

    this.setState({active: room});
  },
  _activateTab: function(tab) {
    this.setState({active: tab});
  },
  _onChange: function() {
    this.setState({messages: MessageStore.getAll()});
  },
  _onNick: function(nick) {
    this.setState({nick: nick});
  }
});
