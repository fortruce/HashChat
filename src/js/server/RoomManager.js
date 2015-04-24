var Events = require('../Events'),
    isValid = require('../Validators').room;

var rooms = {};

/**
 * Subscribe to interested events over pubsub channel.
 * @param  {EventEmitter} pubsub The publish/subscribe channel.
 */
function init(pubsub) {

  function join(socket, room) {
    // Silently ignore invalid room join requests
    if (!isValid(room))
      return;

    // Create the room if it doesn't exist - Publish ROOM_CREATE event
    if (!rooms[room]) {
      rooms[room] = {ids: {},
                     count: 0};
      pubsub.publish(Events.internal.ROOM_CREATE, new Events.internal.RoomCreate(room));
    }

    // Socket is already a member of Room
    if (rooms[room].ids[socket.id])
      return;

    socket.join(room);
    socket.to(room).emit(Events.server.MESSAGE, new Events.server.Message(room,
                                      socket.id + ' joined room'));
    socket.emit(Events.server.MESSAGE, new Events.server.Message(room,
                                      'you joined ' + room));
    rooms[room].ids[socket.id] = true;
    rooms[room].count++;
  }

  function leave(socket, room) {
    if (!rooms[room])
      return;

    if (rooms[room].ids[socket.id]) {
      socket.to(room).emit(Events.server.MESSAGE, new Events.server.Message(room,
                                                socket.id + ' left room'));
      socket.leave(room);
      rooms[room].ids[socket.id] = undefined;
      rooms[room].count--;

      if (rooms[room].count <= 0) {
        pubsub.publish(Events.internal.ROOM_DESTROY, new Events.internal.RoomDestroy(room));
        delete rooms[room];
      }
    }
  }

  function forAllRooms(socket, cb) {
    for (var room in rooms) {
      if (rooms.hasOwnProperty(room)) {
        if (rooms[room].ids[socket.id]) {
          cb(room);
        }
      }
    }
  }

  function disconnect(socket) {
    socket.leaveAll();
    forAllRooms(socket, (r) => leave(socket, r));
  }

  console.log('[RoomManager]: init');
  pubsub.subscribe(Events.client.JOIN, (o) => join(o.socket, o.room));
  pubsub.subscribe(Events.client.LEAVE, (o) => leave(o.socket, o.room));
  pubsub.subscribe(Events.client.DISCONNECT, (o) => disconnect(o.socket));

  pubsub.subscribe(Events.internal.NICK_CHANGE, (o) => {
    var message = o.oldNick + ' is now known as ' + o.newNick;
    forAllRooms(o.socket, (r) => {
      o.socket.to(r).emit(Events.server.MESSAGE,
                        new Events.server.Message(r, message));
    });
  });
}

var RoomManager = {
  init: init
};

module.exports = RoomManager;