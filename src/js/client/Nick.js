var React = require('react'),
    socket = require('./SocketManager'),
    Events = require('../Events'),
    isValid = require('../Validators').nick,
    EditableButton = require('./EditableButton');

module.exports = React.createClass({
    render() {
        return (
            <EditableButton text={this.props.nick}
                            validator={isValid}
                            className="nick"
                            onChange={this._onChange} />
        );
    },
    _onChange(nick) {
        if (nick !== this.props.nick)
            socket.emit(Events.client.NICK, new Events.client.Nick(nick));
    }
});
