const events = require('events');

const botEvents = new events.EventEmitter();
module.exports = botEvents;

// Modules
const { __ } = require('../logger.js');
const { twitterConfig } = require('../../config.js');
const { UserStatus } = require('../database/mongoose.js');
const { resolvePending } = require('../helpers/pending.js');
const parseCommand = require('../helpers/parseCommand.js');

const actions = require('../actions.js');
const commands = require('../commands.js');


botEvents.on('tweet', (tweet) => {
  const userId = tweet.user.id_str;
  if (twitterConfig.admin.includes(userId)) {
    if (tweet.text.includes('Félicitations aux gagnants')) {
      const params = {
        userId,
        winners: tweet.entities.user_mentions.slice(0, 3),
      };
      actions.addWinners(params);
    }
  }
});


botEvents.on('dm', (userId, messageObject) => {
  const { message_data: messageData } = messageObject;
  const message = messageData.text.toLowerCase();

  const fnExact = {
    pending: resolvePending,
    adding_winners: actions.tryAddWinners,
    add_winners: actions.waitForWinners,
    update_rewards: actions.updateRewards,
    updating_rewards: actions.updatingRewards,
    cancel: actions.end,
    claim_rewards: actions.claimRewards,
    generate_invoice: actions.generateInvoice,
    get_rewards_info: actions.sendRewardsInfo,
    send_cdt_menu: (params) => actions.sendMenu(params, ['fidelity']),
    cdt_withdraw: actions.withdraw,
    cdt_link_address: actions.linkAddress,
    cdt_get_address: actions.getAddress,
    cdt_refund: undefined,
  };

  const fnStartsWith = {
    claim_rewards_: actions.claimRewards,
  };

  const cmdExact = {
    start: actions.sendMenu,
    withdraw: commands.withdraw,
    deposit: commands.deposit,
    link: commands.linkAddress,
    help: actions.help,
  };

  const params = {
    userId, message, messageData,
  };

  if (message === 'cancel') return actions.end(params);

  UserStatus
    .get(userId)
    .then((status) => {
      params.status = status;

      const { command, args } = parseCommand(message);

      if (Object.prototype.hasOwnProperty.call(cmdExact, command)) {
        return cmdExact[command](params, args);
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
