const events = require('events');

const botEvents = new events.EventEmitter();
module.exports = botEvents;

// Modules
const { __ } = require('../logger.js');
const { twitterConfig } = require('../../config.js');
const { UserStatus } = require('../database/mongoose.js');
const { resolvePending } = require('../helpers/pending.js');
const parseCommand = require('../helpers/parseCommand.js');
const Twitter = require('../Twitter.js');

const actions = require('../actions.js');
const commands = require('../commands.js');
const fidelity = require('../fidelity.js');

const messageTemplates = require('../../data/message_templates.json');
const insertVariablesInTemplate = require('../helpers/insertVariablesInTemplate.js');

botEvents.on('tweet', async (tweet) => {
  const userId = tweet.user.id_str;
  const tweetId = tweet.id_str;
  const content = tweet.text;
  const mentions = tweet.entities.user_mentions;

  if (userId === twitterConfig.user_id_bot) return;
  __(`New tweet from ${userId} :\nID - ${tweetId}\nContent - ${content}`);

  if (twitterConfig.admin.includes(userId)) {
    if (content.includes('Félicitations aux gagnants')) {
      const params = {
        userId,
        winners: tweet.entities.user_mentions.slice(0, 3),
      };
      actions.addWinners(params);
    }
  }

  const sendRegex = /@lkmt_test send (\d+) CDT( to @(.+))?/;
  if (sendRegex.test(content)) {
    const resultArray = sendRegex.exec(content);
    const amount = resultArray[1];
    const recipientObject = mentions.find((user) => user.screen_name === resultArray[3]) || await Twitter.getUserInfo({ userId: tweet.in_reply_to_user_id_str });

    if (!recipientObject || recipientObject.id_str === twitterConfig.user_id_bot) {
      return Twitter.replyToTweet(tweetId, 'You have to provide one recipient, by replying to someone, or specifying it. Here is an example :\n\n \'@lkmt_test send 1 CDT to @Cryptodidacte\'');
    }

    __(`Tweet : send ${amount} CDT to @${recipientObject.screen_name}`);

    const from = tweet.user;
    if (from.id_str === recipientObject.id_str) return Twitter.replyToTweet(tweetId, insertVariablesInTemplate(messageTemplates.fidelity.error, { err: 'You cannot send tokens to yourself.' }).text);

    fidelity.sendTokens(from, recipientObject, amount)
      .then(() => {
        Twitter.sendMessage(recipientObject.id_str, insertVariablesInTemplate(messageTemplates.fidelity.received, { sender: from.screen_name, amount }));
        Twitter.replyToTweet(tweetId, insertVariablesInTemplate(messageTemplates.fidelity.sendTweetOk, { to: recipientObject.screen_name, amount }).text);
      })
      .catch((err) => Twitter.sendMessage(userId, { description: insertVariablesInTemplate(messageTemplates.fidelity.error, { err: err.message }) }));
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
    cdt_get_address: commands.getAddress,
    cdt_display_balance: commands.getBalance,
    cdt_help: commands.help,
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
    linked: commands.getAddress,
    balance: commands.getBalance,
    send: commands.send,
    help: commands.help,
  };

  const params = {
    userId, message, messageData,
  };

  if (message === 'cancel') return actions.end(params);

  UserStatus
    .get(userId)
    .then((status) => {
      params.status = status;

      if (Object.prototype.hasOwnProperty.call(messageData, 'quick_reply_response')) {
        const { metadata } = messageData.quick_reply_response;

        if (Object.prototype.hasOwnProperty.call(fnExact, metadata)) {
          return fnExact[metadata](params);
        }
      }

      const { command, args } = parseCommand(message);

      if (Object.prototype.hasOwnProperty.call(cmdExact, command)) return cmdExact[command](params, args);

      if (status === undefined) return undefined;
      if (Object.prototype.hasOwnProperty.call(fnExact, status)) return fnExact[status](params);

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
