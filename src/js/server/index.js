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
  socket.emit(Events.NICK, socket.nick);

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
  for (var key in Events) {
    if (Events.hasOwnProperty(key)) {
      // only register publishers Event strings
      if (typeof Events[key] === 'string') {
        var ev = Events[key];
        socket.on(ev, publishEvent(ev));
      }
    }
  }

  // leave all rooms
  socket.on(Events.DISCONNECT, function() {
    NickManager.unregister(socket.nick);
  });

  socket.on(Events.NICK, function(nick) {
    nick = nick.nick;

    var nickSuccess = NickManager.change(socket.nick, nick);
    if (nickSuccess !== true) {
      socket.emit(Events.MESSAGE, new Events.Message(true, nickSuccess, 'Server'));
      return;
    }

    socket.nick = nick;

    socket.emit(Events.NICK, socket.nick);
  });

  // forward chat events to the room they came from
  socket.on(Events.MESSAGE, function(message) {
    var room = message.room;

    message.user = 'test';

    io.to(room)
      .emit(Events.MESSAGE, message);
  });
}