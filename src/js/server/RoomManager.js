var Events = require('../Events');

var rooms = {};

/**
 * Subscribe to interested events over pubsub channel.
 * @param  {EventEmitter} pubsub The publish/subscribe channel.
 */
function init(pubsub) {

  function join(socket, room) {
    console.log('[RoomManager]: join(', socket.id, room, ')');
    if (!rooms[room]) {
      // create the room and publish room created event
      rooms[room] = {ids: {},
                     count: 0};
      pubsub.publish(Events.ROOM_CREATE, new Events.RoomCreate(room));
    }

    // socket already in room
    if (rooms[room].ids[socket.id])
      return;

    socket.join(room);
    socket.to(room).emit(Events.MESSAGE, new Events.Message(room,
                                      socket.id + ' joined room', 'Server'));
    socket.emit(Events.MESSAGE, new Events.Message(room,
                                      'you joined ' + room, 'Server'));
    rooms[room].ids[socket.id] = true;
    rooms[room].count++;
  }

  function leave(socket, room) {
    console.log('[RoomManager]: leave(', socket.id, room, ')');
    if (!rooms[room])
      return;

    if (rooms[room].ids[socket.id]) {
      socket.to(room).emit(Events.MESSAGE, new Events.Message(room,
                                                socket.id + ' left room', 'Server'));
      socket.leave(room);
      rooms[room].ids[socket.id] = undefined;
      rooms[room].count--;

      if (rooms[room].count <= 0) {
        pubsub.publish(Events.ROOM_DESTROY, new Events.RoomDestroy(room));
        delete rooms[room];
      }
    }
  }

  function disconnect(socket) {
    // leave all rooms
    console.log('[RoomManager]: disconnect(', socket.id, ')');
    socket.leaveAll();

    for (var room in rooms) {
      if (rooms.hasOwnProperty(room)) {
        if (rooms[room].ids[socket.id])
          leave(socket, room);
      }
    }
  }

  console.log('[RoomManager]: init');
  pubsub.subscribe(Events.JOIN, (o) => join(o.socket, o.room));
  pubsub.subscribe(Events.LEAVE, (o) => leave(o.socket, o.room));
  pubsub.subscribe(Events.DISCONNECT, (o) => disconnect(o.socket));
}

var RoomManager = {
  init: init
};

module.exports = RoomManager;