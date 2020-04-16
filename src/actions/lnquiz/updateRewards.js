const { __ } = require('../../logger.js');
const Twitter = require('../../Twitter.js');
const lnquiz = require('../../lnquiz.js');
const { end, retry } = require('../global.js');
const { UserStatus } = require('../../database/mongoose.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');

function updateRewards(params) {
  const { userId } = params;
  Twitter.sendMessage(userId, messageTemplates.lnquiz.askForRewards);
  return UserStatus.set(userId, 'updating_rewards');
}

function sendRewardsInfo(params) {
  const { userId } = params;
  Twitter.sendMessage(userId, insertVariablesInTemplate(messageTemplates.lnquiz.currentRewards, lnquiz.rewards));
}

function updatingRewards(params) {
  const { message } = params;

  if (/^(\d+ \d+ \d+)$/.test(message)) {
    const amounts = message.split(' ');
    const newRewards = {
      question: Number(amounts[0], 10),
      writing: Number(amounts[1], 10),
      random: Number(amounts[2], 10),
    };
    __('Trying to update rewards : ');
    __(newRewards);

    lnquiz.updateRewards(newRewards, (err) => {
      if (err) {
        __('events.js@updateRewards : Got error ', 9);
        __(err, 9);

        return retry(params);
      }

      end(params, messageTemplates.global.done, { endMessage: false });
      return sendRewardsInfo(params);
    });
  } else {
    // Not matching pattern
    return retry(params);
  }
}

module.exports = {
  updateRewards,
  updatingRewards,
  sendRewardsInfo,
};
