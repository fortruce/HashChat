/**
 * All Events pass an object over the channel.
 * The object is expected to have the following keys.
 */

module.exports = {
  // Events provided by Socket (do not follow the above contract)
  socket: {
    CONNECTION: 'connection'
  },

  client: {
    // Events provided by Client
    // Events will be augmented with {socket}
    MESSAGE: 'message', // {room, message} | {room, message, user}
    NICK: 'nick',       // {nick} | {nick}
    JOIN: 'join',       // {room}
    LEAVE: 'leave',      // {room}
    DISCONNECT: 'disconnect', // {}
  },

  // Events fired internally by various server components
  // These events are not augmented with any additional info
  ROOM_CREATE: 'room/create', // {room}
  ROOM_DESTROY: 'room/destroy', // {room}
  CONNECT: 'connect', // {socket}

  // Event helper constructors - using these allows easier updating
  // of event contracts
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
