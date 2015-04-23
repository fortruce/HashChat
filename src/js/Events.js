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
    // Events sent from the Client to the Server
    // Events will be augmented with {socket}
    MESSAGE:    'client/message',     // {room, message}
    NICK:       'client/nick',        // {nick} | {nick}
    JOIN:       'client/join',        // {room}
    LEAVE:      'client/leave',       // {room}
    DISCONNECT: 'client/disconnect',  // {}

    Join(room) {
      this.room = room;
    },
    Leave(room) {
      this.room = room;
    },
    Nick(nick) {
      this.nick = nick;
    },
    Message(room, message) {
      this.room = room;
      this.message = message;
    },
  },

  server: {
    // Events sent from the Server to the Client
    MESSAGE:      'server/message',       // {[room], message, user}
    NICK:         'server/nick',

    Nick(nick) {
      this.nick = nick;
    },
    Message(room, message, user) {
      this.room = room;
      this.message = message;
      this.user = user || 'Server';
    }
  },

  internal: {
    // Events fired internally by various server components
    // These events are not augmented with any additional info
    ROOM_CREATE:  'server/room/create',     // {room}
    ROOM_DESTROY: 'server/room/destroy',    // {room}
    CONNECT:      'server/connect',         // {socket}
    NICK_CHANGE:  'server/nick/change',     // {socket, oldNick, newNick}

    RoomCreate(room) {
      this.room = room;
    },
    RoomDestroy(room) {
      this.room = room;
    },
    NickChange(socket, oldNick, newNick) {
      this.socket = socket;
      this.oldNick = oldNick;
      this.newNick = newNick;
    },
    Connect(socket) {
      this.socket = socket;
    }
  }
};
