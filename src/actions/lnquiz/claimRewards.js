const { __ } = require('../../logger.js');
const Twitter = require('../../Twitter.js');
const lightning = require('../../lightning.rest.js');
const lnquiz = require('../../lnquiz.js');
const { LNQuizReward, UserStatus } = require('../../database/mongoose.js');
const { end, retry } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');

function claimRewards(params) {
  const { message, userId, status } = params;

  if (message.startsWith('ln')) {
    const amount = status.split('_')[2];
    const invoice = message;

    lightning.getInvoiceData(invoice,

      (result) => {
        if (result.num_satoshis === amount) {
          Twitter.sendMessage(userId, messageTemplates.lnquiz.wip);
          __('events.js@claimRewars : An invoice is being paid');

          lightning.payInvoice(invoice, () => {
            LNQuizReward.deleteMany({ userId });
            __('events.js@claimRewars : Reward paid, document(s) removed !', 2);

            //* ** TODO : Should I send message "end of action" ?***//
            return end(userId, messageTemplates.lnquiz.paid);
          }, (err) => {
          // Cannot pay invoice
            Twitter.sendMessage(userId, messageTemplates.lnquiz.error);
            __('Could not pay invoice, got following error : ', 9);
            __(err.payment_error, 9);
            return end(params, `Error log : ${err.payment_error}`);
          });
        } else {
        // / Amounts not corresponding
          return retry(params, insertVariablesInTemplate(messageTemplates.lnquiz.badAmount, { amount: result.num_satoshis, expectedAmount: amount }));
        }
      },

      // / ERROR AT GETTING INVOICE DATA
      (err) => {
      //* * CANCELLATION (?) **/
        __("events.js@claimRewards:lightning.getInvoiceData : Couldn't get invoice data, got following error : ", 9);
        __(err, 9);
        return end(params, messageTemplates.lnquiz.error);
      });
  } else {
    return retry(params);
  }
}

function countRewards(params) {
  lnquiz.countRewards(params.userId, (amount) => {
    if (amount) {
      Twitter.sendMessage(params.userId, insertVariablesInTemplate(messageTemplates.lnquiz.askForInvoice, { amount }));
      return UserStatus.set(params.userId, `claim_rewards_${amount}_sats`);
    }
    return end(params, messageTemplates.lnquiz.nothing);
  });
}

module.exports = {
  claimRewards,
  countRewards,
};
