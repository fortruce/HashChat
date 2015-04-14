var React = require('react');

var ChatBox = React.createClass({
  render: function() {
    return (
      <div className="chatBox">
        Hello World! I am a ChatBox. Hi! Again...
      </div>
    );
  }
});

React.render(
  <ChatBox />,
  document.getElementById('app')
);
