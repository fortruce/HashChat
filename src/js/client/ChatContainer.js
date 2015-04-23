var React = require('react'),
    socket = require('./SocketManager'),
    Events = require('../Events'),
    MessageStore = require('./MessageStore'),

    Tabs = require('./Tabs'),
    Nick = require('./Nick'),
    EditableButton = require('./EditableButton'),
    MessageList = require('./MessageList'),
    MessageInput = require('./MessageInput'),
    isValidRoom = require('../Validators').room;

module.exports = React.createClass({
  getInitialState() {
    return {active:   'hashchat',
            nick:     '',
            messages: MessageStore.getAll()};
  },

  componentDidMount() {
    // register listeners
    MessageStore.addChangeListener(this._onChange);
    socket.on(Events.server.NICK, this._onNick);

    socket.emit(Events.client.JOIN, new Events.client.Join(this.state.active));
  },

  onMessageSubmit(message) {
    socket.emit(Events.client.MESSAGE, new Events.client.Message(this.state.active,
                              message.message));
  },

  componentWillUnmount() {
    MessageStore.removeChangeListener(this._onChange);
    socket.removeListener(Events.server.NICK, this._onNick);
  },

  render() {
    var messages = MessageStore.getMessages(this.state.active);
    return (
      <div className="chatContainer">
        <Tabs tabs={MessageStore.rooms()}
              validator={isValidRoom}
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

  _addTab(room) {
    socket.emit(Events.client.JOIN, new Events.client.Join(room));

    console.log('setting state to ', room);
    this.setState({active: room});
  },
  _activateTab(tab) {
    this.setState({active: tab});
  },
  _onChange() {
    this.setState({messages: MessageStore.getAll()});
  },
  _onNick(o) {
    this.setState({nick: o.nick});
  }
});
