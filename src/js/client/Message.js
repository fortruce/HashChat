var React = require('react'),
    crypto = require('crypto');

// create a 6 digit # color code from a string
function stringToColor(s) {
  var hash = 0;
  for (var i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  for (var x = 0, color = '#'; x < 3; x++) {
    color += ('00' + ((hash >> x * 8) & 0xFF).toString(16))
             .slice(-2);
  }
  return color;
}

module.exports = React.createClass({
  render: function() {
    return (
      <div className="message">
        <div style={{color: stringToColor(this.props.user)}} className="message__user">
          {this.props.user}
        </div>
        <p className="message__text">{this.props.children.toString()}</p>
      </div>
    );
  }
});
