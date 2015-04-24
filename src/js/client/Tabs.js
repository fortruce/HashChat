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
              {tabs}
              <EditableButton initialText=''
                              isValid={this.props.validator}
                              submit={this._onAdd} />
          </div>
      );
  },
  _onAdd(tab) {
      this.props.onAdd(tab);
  },
  _setActive(e) {
    if (e.target && e.target.className.indexOf('tab') !== -1)
      this.props.onActivate(e.target.innerText);
  }
});