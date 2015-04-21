var TwitManager = require('./TwitManager'),
    socket = require('./index'),
    Events = require('../Events'),
    io = require('./app').io;

var rooms = {};

function join(user, room) {
	if (!rooms[room]) {
    // room is being joined for the first time
		rooms[room] = {users: {}, count: 0};

    console.log('RoomManager:', 'subscribing to [', room, ']');
    rooms[room].callback = TwitManager.subscribe(room, function (tweets) {
      tweets.reverse();
      console.log('RoomManager: received [', tweets.length, '] tweets');
      tweets.map((tweet) => io.to(room).emit(Events.MESSAGE, {
        room: room,
        message: tweet.text,
        user: 'Twitter'
      }));
    });
  }

	rooms[room].users[user] = true;
  rooms[room].count++;
}

function leave(user, room) {
	if (!rooms[room])
		return;

	rooms[room].users[user] = undefined;
  rooms[room].count--;
  if (!rooms[room].count) {
    // empty room, unsub and destroy
    TwitManager.unsubscribe(room, rooms[room].callback);
    delete rooms[room];
  }
}

var RoomManager = {
	joinRoom(user, room) {
		join(user, room);
	},

	leaveRoom(user, room) {
		leave(user, room);
	}
}

module.exports = RoomManager;