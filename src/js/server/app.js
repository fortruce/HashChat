var app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

module.exports = {
	app: app,
	http: http,
	io: io
};