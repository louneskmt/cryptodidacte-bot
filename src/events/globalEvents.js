const events = require('events');
const botEvents = require('./botEvents.js');
const cryptodidacteEvents = require('./cryptodidacteEvents.js');
const fidelity = require('../fidelity.js');
const { twitterConfig } = require('../../config.js');

const globalEvents = new events.EventEmitter();

globalEvents.on('bot', (body) => {
  if (Object.prototype.hasOwnProperty.call(body, 'direct_message_events')) {
    const messageObject = body.direct_message_events[0].message_create;
    const userId = messageObject.sender_id;

    if (userId !== twitterConfig.user_id_bot) {
      botEvents.emit('dm', userId, messageObject);

      const eventData = {
        eventType: 'direct_message',
        sender: messageObject.sender_id,
        recipient: messageObject.target.recipient_id,
        content: messageObject.message_data.text,
      };
      botEvents.emit('logs', eventData);
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'tweet_create_events')) {
    botEvents.emit('tweet', body.tweet_create_events[0]);
  }
});

globalEvents.on('cryptodidacte', (body) => {
  if (Object.prototype.hasOwnProperty.call(body, 'tweet_create_events')) {
    const tweet = body.tweet_create_events[0];
    if (tweet.user.id_str === twitterConfig.user_id_cryptodidacte) return;

    const eventData = {
      userId: tweet.user.id_str,
      username: tweet.user.screen_name,
      eventType: String,
      tweetId: tweet.id_str,
      targetTweetId: String,
      timestamp: tweet.timestamp_ms / 1000,
    };

    if (Object.prototype.hasOwnProperty.call(tweet, 'retweeted_status')) eventData.eventType = 'retweet';
    else if (tweet.in_reply_to_user_id_str === twitterConfig.user_id_cryptodidacte) eventData.eventType = 'reply';
    else if (tweet.in_reply_to_user_id_str
      && tweet.in_reply_to_user_id_str !== twitterConfig.user_id_cryptodidacte) return;
    else if (tweet.is_quote_status) eventData.eventType = 'quote';

    switch (eventData.event_type) {
      case 'quote':
        eventData.targetTweetId = tweet.quoted_status.id_str;
        break;
      case 'reply':
        eventData.targetTweetId = tweet.in_reply_to_status_id_str;
        break;
      case 'retweet':
        eventData.targetTweetId = tweet.retweeted_status.id_str;
        break;
      default:
        return;
    }

    fidelity.processEvent(eventData);
    cryptodidacteEvents.emit('logs', eventData);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'favorite_events')) {
    const favorite = body.favorite_events[0];
    if (favorite.user.id_str === twitterConfig.user_id_cryptodidacte) return;

    const eventData = {
      userId: favorite.user.id_str,
      username: favorite.user.screen_name,
      eventType: 'favorite',
      tweetId: undefined,
      targetTweetId: favorite.favorited_status.id_str,
      timestamp: favorite.timestamp_ms,
    };

    fidelity.processEvent(eventData);
    cryptodidacteEvents.emit('logs', eventData);
  }
});

globalEvents.on('logs', (type, eventData) => {
  switch (type) {
    case 'bot':
      botEvents.emit('logs', eventData);
      break;
    case 'cryptodidacte':
      cryptodidacteEvents.emit('logs', eventData);
      break;
    default:
      break;
  }
});

module.exports = globalEvents;
