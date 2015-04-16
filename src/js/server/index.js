var express = require('express'),
    path = require('path'),
    url = require('url'),

    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),

    Nicks = require('./nicks'),
    Rooms = require('./rooms');

app.use(express.static(path.join(__dirname, '..', '..', '..', 'public')));

io.on('connection', function(socket) {
  handler(io, socket);
});

http.listen(8080, function() {
  console.log('server listening on *:8080');
});

var NickManager = new Nicks();

function handler(io, socket) {
  function log() {
    var args = Array.prototype.slice.call(arguments, log.length);
    args.unshift(['[', socket.id, ']: '].join(''));
    console.log.apply(console, args);
  }

  log('connected');

  // generate a random nick for the new socket
  socket.nick = NickManager.randomNick(6);
  socket.emit('nick', socket.nick);

  var general = "general";
  socket.RoomManager = new Rooms(socket);

  // broadcast general room events
  socket.RoomManager.join(general); 

  // leave all rooms
  socket.on('disconnect', function() {
    log('disconnect');
    // remove the socket from all rooms
    socket.RoomManager.leaveAll();

    // remove the sockets registered nick
    NickManager.unregister(socket.nick);
  });

  socket.on('nick', function(nick) {
    log('nick', nick);

    if (nick.length > 16) {
      socket.emit('server', 'nick too long (max: 16)');
      return;
    }

    if (NickManager.exists(nick)) {
      socket.emit('server', 'nick already taken');
      return;
    }

    NickManager.unregister(socket.nick);
    NickManager.register(nick);

    socket.nick = nick;

    socket.emit('nick', socket.nick);
  });

  // forward chat events to the room they came from
  socket.on('chat', function(message) {
    log('chat','room:', message.room,
        'message:', message.message);
    
    // make sure this socket is a member of the room
    var room = message.room;
    if (!socket.RoomManager.exists(room))      
      return;

    message.user = socket.nick;
    
    io.to(room)
      .emit('chat', message);
  });

  // join a new room
  socket.on('join', function(room) {
    log('join', room);
    socket.RoomManager.join(room);
  });

  // leave a room
  socket.on('leave', function(room) {
    log('leave', room);
    RoomManger.leave(room);
  });
};
