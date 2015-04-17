var express = require('express'),
    path = require('path'),
    url = require('url'),

    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),

    ServerMessage = require('./ServerMessage'),
    Events = require('../Events'),
    Nicks = require('./nicks'),
    Rooms = require('./rooms');

app.use(express.static(path.join(__dirname, '..', '..', '..', 'public')));

io.on(Events.CONNECTION, function(socket) {
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
  socket.emit(Events.NICK, socket.nick);

  socket.RoomManager = new Rooms(socket);

  // leave all rooms
  socket.on(Events.DISCONNECT, function() {
    log('disconnect');
    // remove the socket from all rooms
    socket.RoomManager.leaveAll();

    // remove the sockets registered nick
    NickManager.unregister(socket.nick);
  });

  socket.on(Events.NICK, function(nick) {
    log('nick', nick);

    if (nick.length > 16) {
      socket.emit(Events.MESSAGE, new ServerMessage('nick too long (max: 16)'));
      return;
    }

    if (NickManager.exists(nick)) {
      socket.emit(Events.MESSAGE, new ServerMessage('nick already exists'));
      return;
    }

    NickManager.unregister(socket.nick);
    NickManager.register(nick);

    socket.nick = nick;

    socket.emit(Events.NICK, socket.nick);
  });

  // forward chat events to the room they came from
  socket.on(Events.MESSAGE, function(message) {
    log('chat','room:', message.room,
        'message:', message.message);
    
    // make sure this socket is a member of the room
    var room = message.room;
    if (!socket.RoomManager.exists(room))      
      return;

    message.user = socket.nick;
    
    io.to(room)
      .emit(Events.MESSAGE, message);
  });

  // join a new room
  socket.on(Events.JOIN, function(room) {
    log('join', room);
    socket.RoomManager.join(room);
  });

  // leave a room
  socket.on(Events.LEAVE, function(room) {
    log('leave', room);
    RoomManger.leave(room);
  });
};
