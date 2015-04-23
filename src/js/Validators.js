var MIN_ROOM = 3;
var MAX_ROOM = 16;
var ROOM_REGEX = new RegExp('^\\w{' + MIN_ROOM + ',' + MAX_ROOM + '}$');

function isValidRoom(room) {
  return ROOM_REGEX.exec(room);
}

var MIN_NICK = 3;
var MAX_NICK = 16;
var NICK_REGEX = new RegExp('^\\w{' + MIN_NICK + ',' + MAX_NICK + '}$');

function isValidNick(nick) {
  return NICK_REGEX.exec(nick);
}

module.exports = {
  room: isValidRoom,
  nick: isValidNick
};