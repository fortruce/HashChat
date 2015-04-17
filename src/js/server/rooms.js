var Events = require('../Events');

function Rooms(socket) {
  this.socket = socket;
  this.rooms = Object.create(null);
}

Rooms.prototype.join = function(room) {
  if (this.exists(room))
    return;

  this.rooms[room] = true;
  this.socket.join(room);

  var joined = {message: this.socket.nick + ' joined',
                room: room};

  // send joined events to room and client
  this.socket.to(room)
        .emit(Events.SERVER, joined);
  
  this.socket.emit(Events.SERVER, joined);
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

  var left = {message: this.socket.nick + ' disconnected',
              room: room};

  // send leave events to room and client
  this.socket.to(room)
        .emit(Events.SERVER, left);
  this.socket.emit(Events.SERVER, left);
  
  this.socket.leave(room);
}

module.exports = Rooms;
