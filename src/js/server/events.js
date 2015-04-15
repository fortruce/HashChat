exports.join = function(user, room) {
  return {type: 'join',
          room: room,
          user: user};
};

exports.leave = function(user, room) {
  return {type: 'leave',
          room: room,
          user: user};
};

exports.error = function(error) {
  return {type: 'error',
          error: error};
};
