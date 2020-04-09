const {__} = require("../logger.js");
const events = require('events');
const botEvents = require('./botEvents.js');
const cryptodidacteEvents = require('./cryptodidacteEvents.js');
const fidelity = require('../fidelity.js');
const { twitterConfig } = require('../../config.js');

var globalEvents = new events.EventEmitter();

globalEvents.on('bot', (body) => {
    if(body.hasOwnProperty('direct_message_events')) {
        let message_create_object = body.direct_message_events[0].message_create;
        let user_id = message_create_object.sender_id;
    
        if(user_id != twitterConfig.user_id_bot) {
          botEvents.emit('dm', user_id, message_create_object);

          let eventData = {
            event_type: 'direct_message',
            sender: message_create_object.sender_id,
            recipient: message_create_object.target.recipient_id,
            content: message_create_object.message_data.text
          }
          botEvents.emit('logs', eventData);
        }
    }

    if(body.hasOwnProperty('tweet_create_events')) {
      botEvents.emit('tweet', body.tweet_create_events[0]);
    }
});

globalEvents.on('cryptodidacte', (body) => {
  if (body.hasOwnProperty('tweet_create_events')) {
    let tweet = body.tweet_create_events[0];
    if (tweet.user.id_str == twitterConfig.user_id_cryptodidacte) return;

    let eventData = {
      user_id: tweet.user.id_str,
      user_name: tweet.user.screen_name,
      event_type,
      tweet_id: tweet.id_str,
      target_tweet_id,
      timestamp: tweet.timestamp_ms
    }

    if (tweet.hasOwnProperty('retweeted_status')) eventData.event_type = 'retweet';
    else if (tweet.in_reply_to_user_id_str == twitterConfig.user_id_cryptodidacte) eventData.event_type = 'reply';
    else if (tweet.in_reply_to_user_id_str && tweet.in_reply_to_user_id_str != twitterConfig.user_id_cryptodidacte) return;
    else if (tweet.is_quote_status) eventData.event_type = 'quote';

    switch (eventData.event_type) {
      case 'quote':
        evenData.target_tweet_id = tweet.quoted_status.id_str;
        break;
      case 'reply':
        evenData.target_tweet_id = tweet.in_reply_to_status_id_str;
        break;
      case 'retweet':
        evenData.target_tweet_id = tweet.retweeted_status.id_str;
        break;
      default: 
        return;
    }

    fidelity.processEvent(eventData);
    cryptodidacteEvents.emit('logs', eventData);
  }

  if (body.hasOwnProperty('favorite_events')) {
    let favorite = body.favorite_events[0];
    if(favorite.user.id_str == twitterConfig.user_id_cryptodidacte) return;

    let eventData = {
      user_id: favorite.user.id_str,
      user_name: favorite.user.screen_name,
      event_type: 'favorite',
      tweet_id: undefined,
      target_tweet_id: favorite.favorited_status.id_str,
      timestamp: favorite.timestamp_ms
    }

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