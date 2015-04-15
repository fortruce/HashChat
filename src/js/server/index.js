var express = require('express'),
    path = require('path'),
    url = require('url'),

    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),

    crypto = require('crypto');


app.use(express.static(path.join(__dirname, '..', '..', '..', 'public')));

io.on('connection', function(socket) {
  handler(io, socket);
});

http.listen(8080, function() {
  console.log('server listening on *:8080');
});

var Nicks = {}

function randomNick(n) {
  var nick;
  do {
    nick = 'user' + crypto.randomBytes(Math.ceil(n/2))
        .toString('hex')
        .slice(0, n);
  } while (Nicks[nick]);

  Nicks[nick] = true;
  return nick;
}
  

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

function handler(io, socket) {
  function log() {
    var args = Array.prototype.slice.call(arguments, log.length);
    args.unshift(['[', socket.id, ']: '].join(''));
    console.log.apply(console, args);
  }

  socket.nick = randomNick(6);
  socket.emit('nick', socket.nick);

  log('connected');

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
  });

  socket.on('nick', function(nick) {
    log('nick', nick);

    if (Nicks[nick]) {
      log('nick failed');
      socket.emit('event', Events.error('nick already taken'));
      return;
    }

    // unregister old nick
    Nicks[socket.nick] = false;
    
    // set new nick
    Nicks[nick] = true;
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
