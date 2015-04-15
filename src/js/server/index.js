var express = require('express'),
    path = require('path'),
    url = require('url'),

    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),

    Nicks = require('./nicks');

app.use(express.static(path.join(__dirname, '..', '..', '..', 'public')));

io.on('connection', function(socket) {
  handler(io, socket);
});

http.listen(8080, function() {
  console.log('server listening on *:8080');
});

var Events = {
  join: function(user, room) { return {type: 'join',
                                       room: room,
                                       user: user}; },
  leave: function(user, room) { return {type: 'leave',
                                        room: room,
                                        user: user}; },
  error: function(error) { return {type: 'error',
                                   error: error}; }
}

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
  var rooms = Object.create(null);

  // broadcast general room events
  rooms[general] = true;
  socket.join(general);
  socket.broadcast.to(general)
    .emit('event', Events.join(socket.nick,
                               general));

  // leave all rooms
  socket.on('disconnect', function() {
    log('disconnect');
    // remove the socket from all rooms
    for (var room in rooms) {
      if (!rooms[room])
        continue;

      rooms[room] = false;
      io.to(room)
        .emit('event', Events.leave(socket.nick,
                                    room));
      socket.leave(room)
    }
    // remove the sockets registered nick
    NickManager.unregister(socket.nick);
  });

  socket.on('nick', function(nick) {
    log('nick', nick);

    if (NickManager.exists(nick)) {
      socket.emit('event', Events.error('nick already taken'));
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
    if (!(room in rooms))
      return;

    message.user = socket.nick;
    
    io.to(room)
      .emit('chat', message);
  });

  // join a new room
  socket.on('join', function(room) {
    log('join', room);
    if (rooms[room])
      return;
    
    rooms[room] = true;
    socket.join(room);
    io.to(room)
      .emit('event', Events.join(socket.nick,
                                 room));
  });

  // leave a room
  socket.on('leave', function(room) {
    log('leave', room);
    if (!rooms[room])
      return;
    
    rooms[room] = false;
    io.to(room)
      .emit('event', Events.leave(socket.nick,
                                  room));
    socket.leave(room);
  });
};
