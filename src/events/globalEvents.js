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

    if(req.body.hasOwnProperty('tweet_create_events')) {
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
    
        if(sender == Twitter.botId){
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
    let user_id = tweet.user.id_str;
    let user_name = tweet.user.screen_name;
    let tweet_id = tweet.id_str;

    __(`${type.toUpperCase()} - Mentionned in tweet ${tweet_id} by @${user_name} (${user_id})`);
  }

  if(body.hasOwnProperty('favorite_events')) {
    let favorited = body.favorite_events[0];
    let user_id = favorited.user.id_str;
    let user_name = favorited.user.screen_name;
    let tweet_id = favorited.id_str;

    __(`${type.toUpperCase()} - Tweet ${tweet_id} favorited by @${user_name} (${user_id})`);
  }

  if(body.hasOwnProperty('follow_events')) {
    let follow_event = body.follow_events[0];
    let target = follow_event.target;
    let source = follow_event.source;

    __(`${type.toUpperCase()} - @${target.screen_name} followed by @${source.screen_name}`);
  }
})

module.exports = globalEvents;