var crypto = require('crypto');

var nicks = {};

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

function init (pubsub) {
  pubsub.subscribe(Events.client.NICK, (o) => register(o.socket, o.nick));
  pubsub.subscribe(Events.client.DISCONNECT, (o) => unregister(o.socket, o.nick));
}

function exists(nick) {
  return nicks[nick];
}

function register(nick) {
  if (exists(nick)) {
    return 'nick already exists';
  }
  if (nick.length > 16 || nick.length < 1) {
    return 'nick must be between 1 and 16 characters';
  }

  nicks[nick] = true;
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
