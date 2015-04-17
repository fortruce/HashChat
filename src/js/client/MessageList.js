var React = require('react'),
    Message = require('./Message');

module.exports = React.createClass({
  render: function() {
    var messages = this.props.messages.map(function (message) {
      return (
        <Message user={message.user}>
          {message.message}
        </Message>
      );
    });
    return (
      <div className="messageList">
        {messages}
      </div>
    );
  }
});
