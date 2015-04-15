var Events = require('./events');

function Rooms(socket) {
  this.socket = socket;
  this.rooms = Object.create(null);
}

Rooms.prototype.join = function(room) {
  if (this.exists(room))
    return;

  this.rooms[room] = true;
  this.socket.join(room);

  var joined = Events.join(this.socket.nick,
                           room);

  // send joined events to room and client
  this.socket.to(room)
        .emit('event', joined);
  
  this.socket.emit('event', joined);
}

Rooms.prototype.exists = function(room) {
  return this.rooms[room];
}

Rooms.prototype.leaveAll = function() {
  for (var room in this.rooms)
    this.leave(room);
}

Rooms.prototype.leave = function(room) {
  if (!this.exists(room))
    return;

  this.rooms[room] = false;

  var leave = Events.leave(this.socket.nick,
                           room);

  // send leave events to room and client
  this.socket.to(room)
        .emit('event', leave);
  this.socket.emit('event', leave);
  
  this.socket.leave(room);
}

module.exports = Rooms;
