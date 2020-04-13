const events = require('events');
const { __ } = require('../logger.js');

const botEvents = new events.EventEmitter();

// Twitter modules
const Twitter = require('../Twit.js');
const { twitterConfig } = require('../../config.js');
const interactions = require('../interactions.js');
const { UserStatus } = require('../database/mongoose.js');

const messageTemplates = require('../../data/message_templates');

botEvents.on('tweet', (tweet) => {
  const userId = tweet.user.id_str;
  if (twitterConfig.admin.includes(userId)) {
    if (tweet.text.includes('Félicitations aux gagnants')) {
      const params = {
        userId,
        winners: tweet.entities.user_mentions.slice(0, 3),
      };
      interactions.addWinners(params);
    }
  }
});


botEvents.on('dm', (userId, messageObject) => {
  const { message_data: messageData } = messageObject;
  const message = messageData.text.toLowerCase();

  const fnExact = {
    adding_winners: interactions.tryAddWinners,
    add_winners: interactions.waitForWinners,
    generating_invoice: interactions.generatingInvoice,
    update_rewards: interactions.updateRewards,
    updating_rewards: interactions.updatingRewards,
    cancel: interactions.end,
    start: interactions.start,
    claim_rewards: interactions.countRewards,
    generate_invoice: interactions.generateInvoice,
    get_rewards_info: interactions.sendRewardsInfo,
  };

  const fnStartsWith = {
    claim_rewards_: interactions.claimRewards,
  };

  const params = {
    userId, message, messageData,
  };

  if (message === 'cancel') return interactions.end(params);

  UserStatus
    .get(userId)
    .then((status) => {
      params.status = status;

      if (message === 'start admin' && twitterConfig.admin.includes(userId)) {
        UserStatus.del(userId);
        __('Sending admin menu...');
        return Twitter.sendMessage(userId, messageTemplates.menu.admin);
      }

      if (message === 'start') {
        UserStatus.del(userId);
        return interactions.start(params);
      }

      if (Object.prototype.hasOwnProperty.call(messageData, 'quick_reply_response')) {
        const { metadata } = messageData.quick_reply_response;

        if (Object.prototype.hasOwnProperty.call(fnExact, metadata)) {
          return fnExact[metadata](params);
        }
      }

      if (status === undefined) return undefined;

      if (Object.prototype.hasOwnProperty.call(fnExact, status)) {
        return fnExact[status](params);
      }
      for (const key in fnStartsWith) {
        if (status.startsWith(key)) return fnStartsWith[key](params);
      }
    });
});

botEvents.on('logs', (eventData) => {
  if (eventData.eventType === 'direct_message') {
    const { content } = eventData;
    let { sender, recipient } = eventData;

    if (sender === twitterConfig.user_id_bot) {
      sender = 'BOT';
    } else {
      recipient = 'BOT';
    }

    __(`BOT - Message from ${sender} to ${recipient} : ${content}`);
  }
});

module.exports = botEvents;
