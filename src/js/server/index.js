'use strict';
var babel = require('babel/register'),
    express = require('express'),
    path = require('path'),
    url = require('url'),

    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),

    pubsub = require('./PubSub'),
    assign = require('object-assign'),

    TwitterManager = require('./TwitterManager'),
    Events = require('../Events'),
    NickManager = require('./NickManager'),
    RoomManager = require('./RoomManager');


// Initialize Components
RoomManager.init(pubsub);
TwitterManager.init(pubsub, io);


app.use(express.static(path.join(__dirname, '..', '..', '..', 'public')));

io.on(Events.socket.CONNECTION, function(socket) {
  handler(io, socket);
});

http.listen(8080, function() {
  console.log('server listening on *:8080');
});

function handler(io, socket) {
  // generate a random nick for the new socket
  socket.nick = NickManager.randomNick(6);
  socket.emit(Events.client.NICK, socket.nick);

  pubsub.publish(Events.CONNECT, {socket: socket});

  function publishEvent(event) {
    return function (o) {
      if (typeof o !== 'object')
        o = {socket: socket};
      else
        o = assign({socket: socket}, o);
      pubsub.publish(event, o);
    };
  }

  // Register forwarding of socket Events to pubsub
  for (var key in Events.client) {
    if (Events.client.hasOwnProperty(key)) {
      // only register publishers Event strings
      var ev = Events.client[key];
      if (typeof ev === 'string') {
        socket.on(ev, publishEvent(ev));
      }
    }
  }

  // leave all rooms
  socket.on(Events.client.DISCONNECT, function() {
    NickManager.unregister(socket.nick);
  });

  socket.on(Events.client.NICK, function(nick) {
    nick = nick.nick;

    var nickSuccess = NickManager.change(socket.nick, nick);
    if (nickSuccess !== true) {
      socket.emit(Events.client.MESSAGE, new Events.Message(true, nickSuccess, 'Server'));
      return;
    }

    socket.nick = nick;

    socket.emit(Events.client.NICK, socket.nick);
  });

  // forward chat events to the room they came from
  socket.on(Events.client.MESSAGE, function(message) {
    var room = message.room;

    message.user = 'test';

    io.to(room)
      .emit(Events.client.MESSAGE, message);
  });
}