var Events = require('../Events'),
    ServerMessage = require('./ServerMessage');

function Rooms(socket) {
  this.socket = socket;
  this.rooms = Object.create(null);
}

Rooms.prototype.join = function(room) {
  if (this.exists(room))
    return;

  this.rooms[room] = true;
  this.socket.join(room);

  var joined = new ServerMessage(this.socket.nick + ' joined',
                                room);
               
  // send joined events to room and client
  this.socket.to(room)
        .emit(Events.MESSAGE, joined);
  
  this.socket.emit(Events.MESSAGE, joined);
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

  var left = new ServerMessage(this.socket.nick + ' disconnected',
                              room);

  // send leave events to room and client
  this.socket.to(room)
        .emit(Events.MESSAGE, left);
  this.socket.emit(Events.MESSAGE, left);
  
  this.socket.leave(room);
}

module.exports = Rooms;
