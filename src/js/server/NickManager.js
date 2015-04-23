var crypto = require('crypto'),
    Events = require('../Events'),
    isValid = require('../Validators').nick;

var RANDOM_NICK_LEN = 6;

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
  socket.emit(Events.server.NICK, new Events.server.Nick(nick));
}

function nick(socketid) {
  var n = sockets[socketid];
  if (n)
    return n;
  throw new Error('Requested nick for socket without a nick');
}

function init (pubsub) {
  function changeNick(socket, nick) {
    if (sockets[socket.id] === nick || !isValid(nick))
      return;

    if (nicks[nick])
      return socket.emit(Events.server.MESSAGE,
                    new Events.server.Message(false, 'Nick already taken'));

    var oldNick = sockets[socket.id];
    unsetNick(socket.id);
    setNick(socket.id, nick);

    socket.emit(Events.server.NICK, new Events.server.Nick(nick));
    pubsub.publish(Events.internal.NICK_CHANGE, new Events.internal.NickChange(socket, oldNick, nick));
  }

  pubsub.subscribe(Events.client.NICK, (o) => changeNick(o.socket, o.nick));
  pubsub.subscribe(Events.client.DISCONNECT, (o) => unsetNick(o.socket.id));
  // on connect assign the socket a random unique nick
  pubsub.subscribe(Events.internal.CONNECT, (o) => initNick(o.socket));
}

module.exports = {
  init,
  nick
};
