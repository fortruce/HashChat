var EventEmitter = require('events').EventEmitter,
	assign = require('object-assign');

var pubsub = assign({}, EventEmitter.prototype, {
	publish: function (event, o) {
    console.log('{', event, '}', o.socket ? o.socket.id : o);
		this.emit(event, o);
	},

	subscribe: function(event, callback) {
		this.on(event, callback);
	}
});

module.exports = pubsub;