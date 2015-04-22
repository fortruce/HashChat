var React = require('react'),
    socket = require('./SocketManager'),
    Events = require('../Events'),
    EditableButton = require('./EditableButton');

module.exports = React.createClass({
    render() {
        return (
            <EditableButton text={this.props.nick}
                            maxLength={16}
                            className="nick"
                            onChange={this._onChange} />
        );
    },
    _onChange(nick) {
        if (nick !== this.props.nick)
            socket.emit(Events.NICK, new Events.Nick(nick));
    }
});
