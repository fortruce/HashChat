var crypto = require('crypto');

function Nicks() {
  this.nicks = {}
}

Nicks.prototype.randomNick = function(n) {
  var nick;
  do {
    nick = 'user' + crypto.randomBytes(Math.ceil(n/2))
        .toString('hex')
        .slice(0, n);
  } while (this.exists(nick));
  this.register(nick);
  return nick;
}

Nicks.prototype.exists = function(nick) {
  return this.nicks[nick];
}

Nicks.prototype.register = function(nick) {
  if (this.exists(nick))
    return false;
  return this.nicks[nick] = true;
}

Nicks.prototype.unregister = function(nick) {
  this.nicks[nick] = false;
}

module.exports = Nicks;
