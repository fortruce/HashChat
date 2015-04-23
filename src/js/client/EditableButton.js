var React = require('react');

module.exports = React.createClass({
  getInitialState: function() {
    return {editing: false,
            text: this.props.text};
  },
  componentWillReceiveProps: function(props) {
    this.setState({text: props.text});
  },
  toggleEditing: function() {
    var e = !this.state.editing;

    // revert input if edited value is not valid
    if (this.state.editing && !this.valid())
      this.setState({editing: e, text: this.props.text});

    this.setState({editing: e});
  },
  onChange: function(e) {
    if (e.target.value.length <= this.props.maxLength)
      this.setState({text: e.target.value.trim()});
  },
  valid: function() {
    var t = React.findDOMNode(this.refs.input).value.trim();
    return t.length > 0 && t.length <= this.props.maxLength;
  },
  commitEdit: function() {
    this.toggleEditing();

    if (this.valid())
      this.props.onChange(this.state.text);
  },
  onEnter: function(e) {
    var key = e.keyCode || e.which;
    if (key === 13) {
      this.commitEdit();
    }
  },
  onBlur: function(e) {
    if (this.state.editing)
      this.commitEdit();
  },
  componentDidUpdate: function() {
    if (!this.state.editing)
      return;

    var input = React.findDOMNode(this.refs.input);
    if (document.activeElement === input)
      return;

    // refresh value to put cursor at end
    var val = input.value;
    input.value = val;
    input.focus();
  },
  render: function() {
    var styles = this.state.editing ? [{}, {display: 'none'}] :
                                      [{display: 'none'}, {}];

    return (
      <div className="editableButton">
       <button onClick={this.toggleEditing}
               style={styles[1]}>
         {this.state.text}
       </button>
       <input onBlur={this.onBlur}
              onChange={this.onChange}
              onKeyPress={this.onEnter}
              style={styles[0]}
              type="text" ref="input"
              value={this.state.text}  />
      </div>
    );
  }
});
