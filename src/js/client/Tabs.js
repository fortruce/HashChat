var React = require('react'),
    EditableButton = require('./EditableButton');

module.exports = React.createClass({
  render() {
      var tabs = this.props.tabs.map(function(tab) {
          var active = tab === this.props.active ? "active" : "";
          return (
              <button className={'tab ' + active}>{tab}</button>
          );
      }.bind(this));
      return (
          <div className="tabs"
               onClick={this._setActive}>
              {{tabs}}
              <EditableButton text=''
                              maxLength={20}
                              onChange={this._onAdd} />
          </div>
      );
  },
  _onAdd(tab) {
      this.props.onAdd(tab);
  },
  _setActive(e) {
    console.log('set active');
    if (e.target && e.target.className.indexOf('tab') !== -1)
      this.props.onActivate(e.target.innerText);
  }
});