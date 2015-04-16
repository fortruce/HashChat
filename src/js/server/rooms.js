function Rooms(socket) {
  this.socket = socket;
  this.rooms = Object.create(null);
}

Rooms.prototype.join = function(room) {
  if (this.exists(room))
    return;

  this.rooms[room] = true;
  this.socket.join(room);

  var joined = this.socket.nick + ' joined';

  // send joined events to room and client
  this.socket.to(room)
        .emit('server', joined);
  
  this.socket.emit('server', joined);
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

  var left = this.socket.nick + ' disconnected';

  // send leave events to room and client
  this.socket.to(room)
        .emit('server', left);
  this.socket.emit('server', left);
  
  this.socket.leave(room);
}

module.exports = Rooms;
