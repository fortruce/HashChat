/**
 * All Events pass an object over the channel.
 * The object is expected to have the following keys.
 */

module.exports = {
  // Events provided by Socket (do not follow the above contract)
  socket: {
    CONNECTION: 'connection'
  },

  // Events provided by Client | Server
  // Events will be augmented with {user, socket}
  MESSAGE: 'message', // {room, message}
  NICK: 'nick',       // {nick}
  JOIN: 'join',       // {room}
  LEAVE: 'leave',      // {room}
  ROOM_CREATE: 'room/create', // {room}
  ROOM_DESTROY: 'room/destroy', // {room}
  DISCONNECT: 'disconnect',

  Join(room) {
    this.room = room;
  },

  Leave(room) {
    this.room = room;
  },

  Nick(nick) {
    this.nick = nick;
  },

  Message(room, message, user) {
    this.room = room;
    this.message = message;
    if (user)
      this.user = user;
  },

  RoomCreate(room) {
    this.room = room;
  },

  RoomDestroy(room) {
    this.room = room;
  }
};
