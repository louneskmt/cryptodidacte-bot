const events = require('events');
const {__} = require("../logger.js");
const botEvents = require('./botEvents.js');

const { twitterConfig } = require('../../config.js');

var globalEvents = new events.EventEmitter();

globalEvents.on('bot', (body) => {
    if(body.hasOwnProperty('direct_message_events')) {
        let message_create_object = body.direct_message_events[0].message_create;
        let user_id = message_create_object.sender_id;
    
        if(user_id != twitterConfig.user_id_bot) {
          botEvents.emit('dm', user_id, message_create_object);
        }
    }

    if(body.hasOwnProperty('tweet_create_events')) {
      botEvents.emit('tweet', body.tweet_create_events[0]);
    }
});

globalEvents.on('cryptodidacte', (body) => {

});

globalEvents.on('logs', (type, body) => {
  switch (type) {
    case 'bot':
      if(body.hasOwnProperty("direct_message_events")) {
        let message_create = body.direct_message_events[0].message_create;
        let recipient = message_create.target.recipient_id;
        let sender = message_create.sender_id;
        let content = message_create.message_data.text;
    
        if(sender == twitterConfig.user_id_bot){
          sender = "BOT"
        }else{
          recipient = "BOT"
        }
    
        __(`BOT - Message from ${sender} to ${recipient} : ${content}`);
      }
      break;
    case 'cryptodidacte':
      break;
  }

  if(body.hasOwnProperty('tweet_create_events')) {
    let tweet = body.tweet_create_events[0];
    if(tweet.user.id_str == twitterConfig.user_id_cryptodidacte) return;

    let user_id = tweet.user.id_str;
    let user_name = tweet.user.screen_name;
    let tweet_id = tweet.id_str;

    let type = '';
    if (tweet.hasOwnProperty('retweeted_status')) type = 'retweet';
    else if (tweet.in_reply_to_user_id) type = 'reply';
    else if(tweet.is_quote_status) type = 'quote';

    switch (type) {
      case 'quote':
        // __(tweet);
        __(`${type.toUpperCase()} - @${user_name} (${user_id}) quoted tweet ${tweet.quoted_status.id_str} by ${tweet.quoted_status.user.screen_name}`);
        break;
      case 'reply':
        __(`${type.toUpperCase()} - @${user_name} (${user_id}) replied to tweet ${tweet.in_reply_to_status_id_str} by @${tweet.in_reply_to_screen_name} (${tweet.in_reply_to_user_id_str})`);
        break;
      case 'retweet':
        __(`${type.toUpperCase()} - Tweet ${tweet.retweeted_status.id_str} retweeted by @${user_name} (${user_id})`);
        break;
      default: 
        __(`${type.toUpperCase()} - (Unknown type) Tweet ${tweet_id} by @${user_name} (${user_id})`);
        break;
    }
  }

  if(body.hasOwnProperty('favorite_events')) {
    let favorited = body.favorite_events[0];
    if(favorited.user.id_str == twitterConfig.user_id_cryptodidacte) return;

    let user_id = favorited.user.id_str;
    let user_name = favorited.user.screen_name;
    let tweet_id = favorited.favorited_status.id_str;

    __(`${type.toUpperCase()} - Tweet ${tweet_id} favorited by @${user_name} (${user_id})`);
  }

  if(body.hasOwnProperty('follow_events')) {
    let follow_event = body.follow_events[0];
    let target = follow_event.target;
    let source = follow_event.source;

    if(source.id_str == twitterConfig.user_id_cryptodidacte) return;

    __(`${type.toUpperCase()} - @${target.screen_name} ${follow_event.type == 'follow' ? 'followed' : 'unfollowed'} by @${source.screen_name}`);
  }


})

module.exports = globalEvents;