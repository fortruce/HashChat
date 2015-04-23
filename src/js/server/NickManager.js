var crypto = require('crypto');

var RANDOM_NICK_LEN = 6;
var MAX_NICK_LEN = 16;
var MIN_NICK_LEN = 3;

var nicks = {};
var sockets = {};

function randomNick(n) {
  var nick;
  do {
    nick = 'user' + crypto.randomBytes(Math.ceil(n/2))
        .toString('hex')
        .slice(0, n);
  } while (exists(nick));

  register(nick);
  return nick;
}

function register(socket, nick) {
  var errMessage;
  if (nicks[nick]) {
    errMessage = 'That nick is already in use!';
  }
  if (nick.length > MAX_NICK_LEN || nick.length < MIN_NICK_LEN) {
    errMessage = 'nick must be between ' + MIN_NICK_LEN + ' and ' + MAX_NICK_LEN + ' characters long';
  }
  if (errMessage) {
    return socket.emit(Events.MESSAGE, new Events.Message(true, errMessage, 'Server'));
  }

  if (sockets[socket.id] === nick)
    return;

  // if the socket currently holds a nick, unregister old nick
  if (sockets[socket.id])
    unregister(socket.id);
  else
    console.error('socket without a nick!');

  nicks[nick] = true;
  sockets[socket.id] = nick;
}

function unregister(socketid) {
  var nick = sockets[socketid];
  if (nick) {
    nicks[nick] = undefined;
    sockets[socketid] = undefined;
  }
}

function init (pubsub) {
  pubsub.subscribe(Events.client.NICK, (o) => register(o.socket, o.nick));
  pubsub.subscribe(Events.client.DISCONNECT, (o) => unregister(o.socket));
  // on connect assign the socket a random unique nick
  pubsub.subscribe(Events.CONNECT, (o) => register(o.socket, randomNick(RANDOM_NICK_LEN)));
}

function exists(nick) {
  return nicks[nick];
}



function unregister(nick) {
  nicks[nick] = false;
}

function change(oldNick, newNick) {
  var nickValid = reigster(newNick);
  if (nickValid === true) {
    unregister(oldNick);
    return;
  }
  return nickValid;
}

module.exports = {
  randomNick: randomNick,
  unregister: unregister,
  change: change
};
