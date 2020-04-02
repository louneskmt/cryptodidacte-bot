const {__} = require("./logger.js");

var events = require('events');
var eventEmitter = new events.EventEmitter();

// Twitter modules
var Twitter = require('./Twit');
const { twitterConfig } = require('../config.js');
var interactions = require("./interactions");
var user = require('./user.js');


eventEmitter.on('tweet', (tweet) => {
  var user_id = tweet.user.id_str;
  if(twitterConfig.admin.includes(user_id)) {
    if(tweet.text.includes("Félicitations aux gagnants")) {
      var params = {
        user_id: user_id,
        winners: tweet.entities.user_mentions.slice(0,3)
      }
      interactions.addWinners(params);
    }
  } else {
    // Twitter.sendTextMessage(user_id, "I got your tweet, but I have no information about how to process it, sorry.");
  }
});

eventEmitter.on('logs', (body) => {
  if(body.hasOwnProperty("direct_message_events")) {
    var message_create = body.direct_message_events[0].message_create;
    var recipient = message_create.target.recipient_id;
    var sender = message_create.sender_id;
    var content = message_create.message_data.text;

    if(sender == Twitter.botId){
      sender = "BOT"
    }else{
      recipient = "BOT"
    }

    __(`Message from ${sender} to ${recipient} : ${content}`);
    __(message_create);
  }
  if(body.hasOwnProperty('tweet_create_events')) {
    var tweet = body.tweet_create_events[0]
    var user_id = tweet.user.id_str;
    var tweet_id = tweet.id_str;
    var content = tweet.text;

    __(`Mentionned in tweet ${tweet_id} by ${user_id} : ${content}`);
  }
}); 


eventEmitter.on('dm', (user_id, message_create_object) => {
  var message = message_create_object.message_data.text.toLowerCase();
  var message_data = message_create_object.message_data;

  const fn_exact = {
    "adding_winners": interactions.tryAddWinners,
    "add_winners": interactions.waitForWinners,
    "generating_invoice": interactions.generatingInvoice,
    "update_rewards": interactions.updateRewards,
    "updating_rewards": interactions.updatingRewards,
    "cancel": interactions.end,
    "start": interactions.start,
    "receive_sats": interactions.receiveSats,
    "claim_rewards": interactions.countRewards,
    "generate_invoice": interactions.generateInvoice,
    "get_rewards_info": interactions.sendRewardsInfo
  }

  const fn_startsWith = {
    "claim_rewards_": interactions.claimRewards
  }

  const params = {
    user_id, message, message_data
  };

  if(message === "cancel") return interactions.end(params);

  user.getStatus(user_id, (status) => {
    params.status = status;

    if(message === "start admin" && twitterConfig.admin.includes(user_id)) {
      user.deleteStatus(user_id);
      __("Sending admin menu...")
      return Twitter.sendAdminMenu(user_id)
    }
  
    if(message === "start"){
      user.deleteStatus(user_id);
      return interactions.start(params);
    }
    
    if(message_data.hasOwnProperty("quick_reply_response")) {
      let metadata = message_data.quick_reply_response.metadata;
  
      if(fn_exact.hasOwnProperty(metadata)){
        return fn_exact[metadata](params);
      }
    }

    if(status === undefined) return;
    
    if(fn_exact.hasOwnProperty(status)){
      fn_exact[status](params);
    } else {
      for (const key in fn_startsWith) {
        if(status.startsWith(key))  fn_startsWith[key](params)
      }
    }

  });
});

module.exports = eventEmitter;
