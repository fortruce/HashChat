var React = require('react');

module.exports = React.createClass({
  getInitialState() {
      return {tabs: []};
  },
  render() {
      var tabs = this.state.tabs.map(r => <button>r</button>);
      return (
          <div>t{{tabs}}</div>
      );
  }
});
