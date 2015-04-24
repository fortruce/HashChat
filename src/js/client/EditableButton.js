var React = require('react');

/**
 * Props
 *
 * initialText  [required]  The initial text value of the component.
 * submit       [required]  Callback when when text is changed fn(text).
 *
 * isValid      [optional]  Callback that returns true/false to validate
 *                          input. Submit will only be called if isValid.
 */

module.exports = React.createClass({
  getInitialState() {
    return {editing: false,
            text: this.props.initialText,
            previousValue: this.props.initialText};
  },

  componentWillReceiveProps(props) {
    this.setState({text: props.initialText,
                   editing: false});
  },

  /**
   * When component renders, give <input> focus if editing.
   */
  componentDidUpdate() {
    if (this.state.editing) {
      var input = React.findDOMNode(this.refs.input);
      if (document.activeElement !== input) {
        var val = input.value;
        input.value = val;
        input.focus();
      }
    }
  },

  /**
   * Input onChange handler to update state.
   * @param  {DOMEvent} e
   */
  onChange(e) {
    var text = e.target.value.trim();
    this.setState({text: text});
  },

  /**
   * Toggle the editing mode. When moving from editing -> !editing,
   *   if isValid: submit value and update previousValue
   *   else: reset text to previousValue
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  toggleEditing(e) {
    if (this.state.editing) {
      //going from editing to done editing, submit change
      var val = e.target.value.trim();

      if (this.props.isValid && !this.props.isValid(val))
        return this.setState({editing: !this.state.editing,
                              text: this.state.previousValue});

      this.props.submit(val);
      return this.setState({editing: !this.state.editing,
                            previousValue: this.state.text});
    }

    this.setState({editing: !this.state.editing});
  },

  onKey(e) {
    var key = e.keyCode || e.which;
    if (key === 13) //enter
      this.toggleEditing(e);
  },

  render() {
    if (this.state.editing) {
      var className = '';
      if (this.props.isValid && !this.props.isValid(this.state.text))
        className = 'invalid';
      return (
        <input  ref='input'
                type="text"
                className={className}
                value={this.state.text}
                onChange={this.onChange}
                onKeyPress={this.onKey}
                onBlur={this.toggleEditing} />
      );
    } else {
      return (
        <button onClick={this.toggleEditing}>
          {this.state.text}
        </button>
      );
    }
  }
});