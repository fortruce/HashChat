var babel = require('babel/register'),
    express = require('express'),
    path = require('path'),

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
NickManager.init(pubsub);


app.use(express.static(path.join(__dirname, '..', '..', '..', 'public')));

io.on(Events.socket.CONNECTION, function(socket) {
  // generate a random nick for the new socket
  pubsub.publish(Events.internal.CONNECT, new Events.internal.Connect(socket));

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

  // forward chat events to the room they came from
  socket.on(Events.client.MESSAGE, function(o) {
    io.to(o.room)
      .emit(Events.server.MESSAGE,
        new Events.server.Message(o.room, o.message, NickManager.nick(socket.id)));
  });
});

http.listen(8080, function() {
  console.log('server listening on *:8080');
});