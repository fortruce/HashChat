var EventEmitter = require('events').EventEmitter,
	assign = require('object-assign');

var pubsub = assign({}, EventEmitter.prototype, {
	publish: function () {
		console.log.apply(console, arguments);
		this.emit.apply(this, arguments);
	},

	subscribe: function(event, callback) {
		this.on(event, callback);
	}
});

module.exports = pubsub;