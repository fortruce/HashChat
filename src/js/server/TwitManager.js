var Twit = require('twitter-apponly'),
    assign = require('object-assign'),
    EventEmitter = require('events').EventEmitter;

var keys = {
  consumer_key: '4emNoR5ABlxlb6xTaMD5QhlqD',
  consumer_secret: '19eLp8zYJAvTAIAqFmJqk9ZypdNOS1gJ3RVS0W15Udwfp2aBPC',
  api_base: 'https://api.twitter.com/1.1/',
  bearer_url: 'https://api.twitter.com/oauth2/token'
};

var hashtags = [];
var tagIndex = {};

var client = new Twit(keys);

var twitterSearchLimit = (60 / (450 / 15)) + 1; // minimum seconds b/w requests with buffer second

function addTag(tag) {
	hashtags.unshift(tag);
  tagIndex[tag] = {};
}

function removeTag(tag) {
	hashtags.splice(hashtags.indexOf(tag), 1);
  delete tagIndex[tag];
}

var TwitManager = assign({}, EventEmitter.prototype, {
  subscribe: function (tag, callback) {
    if (hashtags.indexOf(tag) === -1) {
      addTag(tag);
    }

    this.on(tag, callback);
  },

  unsubscribe: function (tag, callback) {
    this.removeListener(tag, callback);

    if (!this.listeners(tag).length) {
      removeTag(tag);
    }
  },

  emitTag: function (tag, statuses) {
    this.emit(tag, statuses);
  },

  _interval: setInterval(function() {
    if (!hashtags.length)
      return;

    for (var i = 0; i < hashtags.length; i++) {
      if (tagIndex[hashtags[i]].querying)
        continue;
      var tag = hashtags[i];
      hashtags.splice(i, 1);
      query(tag);
      hashtags.push(tag);
    }
  }, twitterSearchLimit * 1000)
});

function query(tag) {
  tagIndex[tag].querying = true;

  var q = {
    q: '#' + tag,
    since_id: tagIndex[tag].since_id || 0,
    count: tagIndex[tag].since_id ? 100 : 1
  };

  client.get('search/tweets', q).then(function (results) {
    tagIndex[tag].querying = false;
    var statuses = results.statuses;
    if (statuses && statuses.length) {
      if (tagIndex[tag].since_id) {
        // only emit once we know we have new tweets
        TwitManager.emitTag(tag, statuses);
      }
      tagIndex[tag].since_id = statuses[0].id_str;
    }
  }, function (err) { 
    tagIndex[tag].querying = false; 
    throw err; 
  });
}

module.exports = TwitManager;