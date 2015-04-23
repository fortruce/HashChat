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
  getInitialState() {
    return {active: 'general',
            nick: '',
            messages: MessageStore.getAll()};
  },

  componentDidMount() {
    // register listeners
    MessageStore.addChangeListener(this._onChange);
    socket.on(Events.client.NICK, (o) => this._onNick(o.nick));

    // join general room
    socket.emit(Events.client.JOIN, new Events.Join(this.state.active));
  },

  onMessageSubmit(message) {
    socket.emit(Events.client.MESSAGE, new Events.Message(this.state.active,
                              message.message));
  },

  componentWillUnmount() {
    MessageStore.removeChangeListener(this._onChange);
    socket.removeListener(Events.client.NICK, this._onNick);
  },

  render() {
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

  _addTab(room) {
    socket.emit(Events.client.JOIN, new Events.Join(room));

    this.setState({active: room});
  },
  _activateTab(tab) {
    this.setState({active: tab});
  },
  _onChange() {
    this.setState({messages: MessageStore.getAll()});
  },
  _onNick(nick) {
    this.setState({nick: nick});
  }
});
