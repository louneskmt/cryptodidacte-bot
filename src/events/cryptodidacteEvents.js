const events = require('events');
const { __ } = require('../logger.js');

const cryptodidacteEvents = new events.EventEmitter();

cryptodidacteEvents.on('logs', (eventData) => {
  const {
    userId, username, eventType, tweetId, targetTweetId,
  } = eventData;

  switch (eventType) {
    case 'quote':
      __(`CRYPTODIDACTE - ${eventType.toUpperCase()} - @${username} (${userId}) quoted tweet ${targetTweetId}`);
      break;
    case 'reply':
      __(`CRYPTODIDACTE - ${eventType.toUpperCase()} - @${username} (${userId}) replied to tweet ${targetTweetId}`);
      break;
    case 'retweet':
      __(`CRYPTODIDACTE - ${eventType.toUpperCase()} - Tweet ${targetTweetId} retweeted by @${username} (${userId})`);
      break;
    case 'favorite':
      __(`CRYPTODIDACTE - Tweet ${targetTweetId} favorited by @${username} (${userId})`);
      break;
    default:
      __(`CRYPTODIDACTE - (Unknown type) - Tweet ${tweetId} by @${username} (${userId})`);
      break;
  }
});

module.exports = cryptodidacteEvents;
