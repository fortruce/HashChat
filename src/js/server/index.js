var babel = require('babel/register')
    express = require('express'),
    path = require('path'),
    url = require('url'),

    app = require('./app'),
    pubsub = require('./PubSub'),

    ServerMessage = require('./ServerMessage'),
    Events = require('../Events'),
    NickManager = require('./NickManager'),
    RO = require('./RoomManager'),
    Rooms = require('./rooms');

var io = app.io;
var http = app.http;
var app = app.app;

app.use(express.static(path.join(__dirname, '..', '..', '..', 'public')));

io.on(Events.CONNECTION, function(socket) {
  handler(io, socket);
});

http.listen(8080, function() {
  console.log('server listening on *:8080');
});

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

    var NickValid = NickManager.change(socket.nick, nick);
    if (nickSuccess !== true) {
      socket.emit(Events.MESSAGE, new ServerMessage(nickValid));
      return;
    }

    // alert the roommanger of a nick change HACK
    RO.joinRoom(nick);
    RO.leaveRoom(socket.nick);

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
    RO.joinRoom(socket.nick, room);
  });

  // leave a room
  socket.on(Events.LEAVE, function(room) {
    log('leave', room);
    RoomManger.leave(room);
    RO.leaveRoom(socket.nick, room);
  });

  for (var key in Events) {
    // Register forwarding of socket Events to pubsub
    if (Events.hasOwnProperty(key)) {
      var ev = Events[key];
      socket.on(ev, (function (event) {
        return function () {
          var args = Array.prototype.slice.call(arguments, 0);
          args.unshift(event);
          pubsub.publish.apply(pubsub, args);
        };
      })(ev));
    }
  }
}
