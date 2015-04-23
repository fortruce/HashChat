var EventEmitter = require('events').EventEmitter,
	assign = require('object-assign');

function without(o) {
  var props = Array.prototype.slice.call(arguments, 1);
  var r = {};
  for (var k in o) {
    if (o.hasOwnProperty(k) && props.indexOf(k) === -1)
      r[k] = o[k];
  }
  return r;
}

var pubsub = assign({}, EventEmitter.prototype, {
	publish: function (event, o) {
    console.log('{', event, '}', without(o, 'socket'));
		this.emit(event, o);
	},

	subscribe: function(event, callback) {
		this.on(event, callback);
	}
});

module.exports = pubsub;