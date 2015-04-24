var React = require('react'),
    socket = require('./SocketManager'),
    Events = require('../Events'),
    isValid = require('../Validators').nick,
    EditableButton = require('./EditableButton');

module.exports = React.createClass({
    render() {
        return (
            <EditableButton initialText={this.props.nick}
                            isValid={isValid}
                            className="nick"
                            submit={this.submit} />
        );
    },
    submit(nick) {
        if (nick !== this.props.nick)
            socket.emit(Events.client.NICK, new Events.client.Nick(nick));
    }
});
