var crypto = require('crypto'),
    Events = require('../Events');

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
  } while (nicks[nick]);

  return nick;
}

function setNick(socketid, nick) {
  sockets[socketid] = nick;
  nicks[nick] = true;
}

function unsetNick(socketid) {
  var nick = sockets[socketid];
  nicks[nick] = undefined;
  sockets[socketid] = undefined;
}

function initNick(socket) {
  var nick = randomNick(RANDOM_NICK_LEN);
  setNick(socket.id, nick);
  socket.emit(Events.client.NICK, new Events.Nick(nick));
}

function isInvalid(nick) {
  if (nicks[nick])
    return 'Nick is already taken.';
  if (nick.length > MAX_NICK_LEN || nick.length < MIN_NICK_LEN)
    return 'Nick must be between ' + MIN_NICK_LEN + ' and ' + MAX_NICK_LEN + ' characters';
  return false;
}

function nick(socketid) {
  var n = sockets[socketid];
  if (n)
    return n;
  throw new Error('Requested nick for socket without a nick');
}

function init (pubsub) {
  function changeNick(socket, nick) {
    if (sockets[socket.id] === nick)
      return;

    // Validate the nickname and emit message if invalid
    var invalid = isInvalid(nick);
    if (invalid)
      return socket.emit(Events.Message, new Events.Message(true, invalid, 'Server'));

    var oldNick = sockets[socket.id];
    unsetNick(socket.id);
    setNick(socket.id, nick);

    socket.emit(Events.client.NICK, new Events.Nick(nick));
    pubsub.publish(Events.NICK_CHANGE, new Events.NickChange(socket, oldNick, nick));
  }

  pubsub.subscribe(Events.client.NICK, (o) => changeNick(o.socket, o.nick));
  pubsub.subscribe(Events.client.DISCONNECT, (o) => unsetNick(o.socket.id));
  // on connect assign the socket a random unique nick
  pubsub.subscribe(Events.CONNECT, (o) => initNick(o.socket));
}

module.exports = {
  init,
  nick
};
