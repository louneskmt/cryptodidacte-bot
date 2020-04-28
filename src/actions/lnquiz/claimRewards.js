const { __ } = require('../../logger.js');
const Twitter = require('../../Twitter.js');
const lightning = require('../../lightning.rest.js');
const lnquiz = require('../../lnquiz.js');
const { LNQuizReward } = require('../../database/mongoose.js');
const { waitForPattern } = require('../../helpers/pending.js');
const { end } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');

async function claimRewards(params) {
  const { userId } = params;

  const amount = await lnquiz.countRewards(userId);
  if (amount === 0) return end(params, messageTemplates.lnquiz.nothing);

  Twitter.sendMessage(params.userId, insertVariablesInTemplate(messageTemplates.lnquiz.askForInvoice, { amount }));

  const response = await waitForPattern(userId);
  if (!response) return end(params, 'Timeout, please try again.');
  const { message: invoice } = response;

  lightning
    .getInvoiceData(invoice)
    .then((result) => {
      if (result === 'Not Found') return end(params, 'Invoice not found.');

      if (result.num_satoshis === amount.toString()) {
        Twitter.sendMessage(userId, messageTemplates.lnquiz.wip);
        __('events.js@claimRewars : An invoice is being paid');

        lightning.payInvoice(invoice, () => {
          LNQuizReward.deleteMany({ userId });
          __('events.js@claimRewars : Reward paid, document(s) removed !', 2);
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
        return end(params, insertVariablesInTemplate(messageTemplates.lnquiz.badAmount, { amount: result.num_satoshis, expectedAmount: amount }));
      }
    })
    .catch((err) => {
      __("events.js@claimRewards:lightning.getInvoiceData : Couldn't get invoice data, got following error : ", 9);
      __(err, 9);
      return end(params, messageTemplates.lnquiz.error);
    });
}

module.exports = claimRewards;
