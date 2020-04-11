const { __ } = require('./logger.js');
const Twitter = require('./Twit');

const lightning = require('./lightning.rest.js');
const QRCode = require('./qrcode.js');
const lnquiz = require('./lnquiz.js');
const userStatus = require('./userStatus.js');
const Database = require('./database.js');

const messageTemplates = require('../data/message_templates');
const insertVariablesInTemplate = require('./helpers/insertVariablesInTemplate.js');


function start(params) {
  const { userId } = params;

  Twitter.sendMessage(userId, messageTemplates.menu.standard);
}

// INTERACTIONS

function end(params, description, { resetStatus = true, endMessage = true } = {}) {
  const { userId } = params;

  if (resetStatus) userStatus.deleteStatus(userId);

  if (description && typeof description === 'string') Twitter.sendTextMessage(userId, description);
  else if (description && typeof description === 'object') Twitter.sendMessage(userId, description);

  if (endMessage) {
    setTimeout(() => {
      Twitter.sendMessage(userId, messageTemplates.global.end);
    }, 1000);
  }

  __(`End of action for ${userId}`);
}


function retry(params, description) {
  const { userId } = params;

  if (description && typeof description === 'string') Twitter.sendTextMessage(userId, description);
  else if (description && typeof description === 'object') Twitter.sendMessage(userId, description);

  setTimeout(() => {
    Twitter.sendMessage(userId, messageTemplates.global.retry);
  }, 1000);
}

async function addWinners(params) {
  const { winners } = params;
  const { newEntries, errCode } = await lnquiz.addWinners(winners);

  if (errCode === 0) {
    __(newEntries, 2);
    for (const winner of newEntries) {
      // const clone = Object.assign(messageTemplates.lnquiz.notify, {});
      Twitter.sendMessage(winner.userId, insertVariablesInTemplate(messageTemplates.lnquiz.notify, { reward: winner.reward }));
    }
    end(params, insertVariablesInTemplate(messageTemplates.lnquiz.confirmAddition, {
      winner1: newEntries[0].username, winner2: newEntries[1].username, winner3: newEntries[2].username,
    }), { endMessage: false });
  } else {
    end(params, messageTemplates.global.error, { endMessage: false });
  }
}

async function tryAddWinners(params) {
  const { messageData } = params;

  if (messageData.entities.user_mentions.length === 3) {
    const newParams = {
      ...params,
      winners: messageData.entities.user_mentions,
    };
    addWinners(newParams);
  } else {
    retry(params, messageTemplates.lnquiz.retry);
  }
}

function generatingInvoice(params) {
  /** ??????? * */

  const { userId } = params;

  Twitter.sendTextMessage(userId, 'Nothing here yet.');
  end(userId);
}

function waitForWinners(params) {
  const { userId } = params;
  Twitter.sendMessage(userId, messageTemplates.lnquiz.askForWinners);
  return userStatus.setStatus(userId, 'adding_winners');
}

function generateInvoice(params) {
  const { userId } = params;

  __('events.js@generateInvoice : Generating an invoice (tip) ');

  Twitter.sendMessage(userId, messageTemplates.tip.wip);
  userStatus.setStatus(userId, 'generating_invoice');

  lightning.generateInvoice(200, '@Cryptodidacte Tip', (invoice) => {
    Twitter.sendMessage(userId, messageTemplates.global.done);

    QRCode.generateQRCode(invoice, (QRCodePath) => {
      __(`QRCodePath :${QRCodePath}`);
      if (QRCodePath !== 'None') {
        Twitter.sendMessageWithImage(userId, invoice, QRCodePath);
      } else {
        Twitter.sendTextMessage(userId, invoice);
      }
      end(params, messageTemplates.tip.thanks, { endMessage: false });
    });
  }, (err) => {
    __('events.js@generateInvoice : Could not generate invoice, got following', 9);
    __(err, 9);

    end(params, messageTemplates.tip.error);
  });
}

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
            const db = new Database('cryptodidacte');
            db.remove('rewards', { userId: userId.toString() }, true);
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

function sendRewardsInfo(params) {
  const { userId } = params;
  Twitter.sendMessage(userId, insertVariablesInTemplate(messageTemplates.lnquiz.currentRewards, lnquiz.rewards));
}

function updateRewards(params) {
  const { userId } = params;
  Twitter.sendMessage(userId, messageTemplates.lnquiz.askForRewards);
  return userStatus.setStatus(userId, 'updating_rewards');
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

function countRewards(params) {
  lnquiz.countRewards(params.userId, (amount) => {
    if (amount) {
      Twitter.sendMessage(params.userId, insertVariablesInTemplate(messageTemplates.lnquiz.askForInvoice, { amount }));
      return userStatus.setStatus(params.userId, `claim_rewards_${amount}_sats`);
    }
    return end(params, messageTemplates.lnquiz.nothing);
  });
}

module.exports = {
  start,
  retry,
  end,
  tryAddWinners,
  addWinners,
  waitForWinners,
  countRewards,
  claimRewards,
  generateInvoice,
  generatingInvoice,
  updateRewards,
  updatingRewards,
  sendRewardsInfo,
};
