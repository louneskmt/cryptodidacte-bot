const {__} = require("../logger.js");

const events = require('events');
var cryptodidacteEvents = new events.EventEmitter();

cryptodidacteEvents.on('logs', (eventData) => {
  let {user_id, user_name, event_type, tweet_id, target_tweet_id} = eventData;

  switch (event_type) {
    case 'quote':
      __(`CRYPTODIDACTE - ${event_type.toUpperCase()} - @${user_name} (${user_id}) quoted tweet ${target_tweet_id}`);
      break;
    case 'reply':
      __(`CRYPTODIDACTE - ${event_type.toUpperCase()} - @${user_name} (${user_id}) replied to tweet ${target_tweet_id}`);
      break;
    case 'retweet':
      __(`CRYPTODIDACTE - ${event_type.toUpperCase()} - Tweet ${target_tweet_id} retweeted by @${user_name} (${user_id})`);
      break;
    case 'favorite':
      __(`CRYPTODIDACTE - Tweet ${target_tweet_id} favorited by @${user_name} (${user_id})`);
      break;
    default: 
      __(`CRYPTODIDACTE - (Unknown type) - Tweet ${tweet_id} by @${user_name} (${user_id})`);
      break;
  };
});

module.exports = cryptodidacteEvents;