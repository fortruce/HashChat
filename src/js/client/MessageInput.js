var React = require('react'),
    Events = require('../Events');

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
  render: function() {
    return (
      <input id="in" onKeyPress={this.handleSubmit}
             className="messageInput" type="text" ref="message" />
    );
  }
});
