var express = require('express'),
    path = require('path'),
    url = require('url'),

    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, '..', '..', 'public')));

function Chat(author, message) {
  this.author = author;
  this.message = message;
}

io.on('connection', function(socket) {
  var room = url.parse(socket.handshake.url, true).query.room;

  socket.join(room);

  socket.broadcast.to(room).emit('chat', new Chat('server', 'user joined room'));
  socket.emit('chat', new Chat('server', 'you joined room'));

  socket.on('chat', function(msg) {
    io.to(room).emit('chat', msg);
  });
});

http.listen(8080, function() {
  console.log('server listening on *:8080');
});
