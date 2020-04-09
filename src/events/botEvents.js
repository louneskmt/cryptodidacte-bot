const {__} = require("../logger.js");

const events = require('events');
var botEvents = new events.EventEmitter();

// Twitter modules
var Twitter = require('../Twit.js');
const { twitterConfig } = require('../../config.js');
var interactions = require('../interactions.js');
var userStatus = require('../userStatus.js');

botEvents.on('tweet', (tweet) => {
  var user_id = tweet.user.id_str;
  if(twitterConfig.admin.includes(user_id)) {
    if(tweet.text.includes("Félicitations aux gagnants")) {
      var params = {
        user_id: user_id,
        winners: tweet.entities.user_mentions.slice(0,3)
      }
      interactions.addWinners(params);
    }
  }
});


botEvents.on('dm', (user_id, message_create_object) => {
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

  userStatus.getStatus(user_id, (status) => {
    params.status = status;

    if(message === "start admin" && twitterConfig.admin.includes(user_id)) {
      userStatus.deleteStatus(user_id);
      __("Sending admin menu...")
      return Twitter.sendAdminMenu(user_id)
    }
  
    if(message === "start"){
      userStatus.deleteStatus(user_id);
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

botEvents.on('logs', eventData => {
  if (eventData.event_type == 'direct_message') {
    let {sender, recipient, content} = eventData;

    if (sender == twitterConfig.user_id_bot) {
      sender = "BOT";
    } else {
      recipient = "BOT";
    }

    __(`BOT - Message from ${sender} to ${recipient} : ${content}`);
  }
});

module.exports = botEvents;
