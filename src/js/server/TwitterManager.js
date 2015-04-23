var Twitter = require('twitter-apponly'),
    assign = require('object-assign'),
    keys = require('./api-keys'),
    Events = require('../Events'),
    EventEmitter = require('events').EventEmitter;

var hashtags = [];
var tagIndex = {};

var client = new Twitter(keys.consumer_key, keys.consumer_secret);

var twitterSearchLimit = (60 / (450 / 15)) + 1; // minimum seconds b/w requests with buffer second

function addTag(tag) {
	hashtags.unshift(tag);
  tagIndex[tag] = {};
}

function removeTag(tag) {
	hashtags.splice(hashtags.indexOf(tag), 1);
  delete tagIndex[tag];
}

function query(tag) {
  tagIndex[tag].querying = true;

  var q = {
    q: '#' + tag,
    since_id: tagIndex[tag].since_id || 0,
    count: tagIndex[tag].since_id ? 100 : 1
  };

  return client.get('search/tweets', q);
}

function init (pubsub, io) {
  pubsub.subscribe(Events.internal.ROOM_CREATE, (o) => addTag(o.room));
  pubsub.subscribe(Events.internal.ROOM_DESTROY, (o) => removeTag(o.room));

  // query for new results for the tracked tags
  // emit the tags to the chatroom
  setInterval(function() {
    if (!hashtags.length)
      return;

    var tag = hashtags.shift();
    query(tag)
      .then(function (body) {
        if (!tagIndex[tag]) {
          // no longer tracking tag
          console.error('no longer tracking tag');
          return;
        }
        // add the tag back onto the query list
        hashtags.push(tag);

        var statuses = body.statuses;
        if (!statuses.length)
          return;

        if (tagIndex[tag].since_id) {
          // only emit if we know we have new tweets (since_id has been initialized)
          statuses.map((status) => {
            io.to(tag).emit(Events.server.MESSAGE, new Events.server.Message(tag, status.text, 'Twitter'));
          });
        }

        // must use id_str since id's are too big for javascript floats
        tagIndex[tag].since_id = statuses[0].id_str;
      })
      .catch(console.error);
  }, twitterSearchLimit * 1000);
}

module.exports = {
  init
};
