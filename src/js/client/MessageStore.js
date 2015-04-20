var EventEmitter = require('events').EventEmitter,
    assign = require('object-assign'),
    Events = require('../Events'),
    socket = require('./SocketManager');

var CHANGE_EVENT = 'change';

var _messages = Object.create(null);

function add(message) {
  if (message.room) { // append to supplied room
    if (_messages[message.room])
      _messages[message.room].push(message);
    else
      _messages[message.room] = [message];
  }
  else { // append to all rooms
    for (var room in _messages) {
      _messages[room].push(message);
    }
  }
}

var MessageStore = assign({}, EventEmitter.prototype, {
  getAll: function() {
    return _messages;
  },

  getMessages: function(room) {
    return _messages[room] || [];
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  leave: function(room) {
    delete _messages[room];
    this.emitChange();
  },

  rooms: function() {
    return Object.keys(_messages);
  }
});

socket.on(Events.MESSAGE, function(message) {
  add(message);
  MessageStore.emitChange();
});

module.exports = MessageStore;
