const { __ } = require('./logger.js');
const Twitter = require('./Twit');

const lightning = require('./lightning.rest.js');
const QRCode = require('./qrcode.js');
const lnquiz = require('./lnquiz.js');
const userStatus = require('./userStatus.js');
const Database = require('./database.js');

const messageTemplates = require('../data/message_templates.json');


function start(params) {
  const { userId } = params;

  Twitter.sendMessage(userId, messageTemplates.menu);
}

// INTERACTIONS

function end(params, description, { resetStatus = true, endMessage = true } = {}) {
  const { userId } = params;

  if (resetStatus) userStatus.deleteStatus(userId);

  if (description) Twitter.sendTextMessage(userId, description);

  if (endMessage) {
    setTimeout(() => {
      Twitter.sendTextMessage(userId, 'End of action 🙃');
    }, 1000);
  }

  __(`End of action for ${userId}`);
}


function retry(params, description) {
  const { userId } = params;

  if (description) Twitter.sendTextMessage(userId, description);

  setTimeout(() => {
    Twitter.sendTextMessage(userId, "❌ Please try again, or send 'Cancel'.");
  }, 1000);
}

async function addWinners(params, winners) {
  const errCode = await lnquiz.addWinners(winners);

  if (errCode === 0) {
    end(params, `✅ You successfully added this three winners : \n\n🏁 @${winners[0].screen_name}\n✍️ @${winners[1].screen_name}\n🎲 @${winners[2].screen_name}`, { endMessage: false });
  } else {
    end(params, 'Sorry, something went wrong', false);
  }
}

async function tryAddWinners(params) {
  const { messageData } = params;

  if (messageData.entities.user_mentions.length === 3) {
    const winners = messageData.entities.user_mentions;

    addWinners(params, winners);
  } else {
    retry(params, "You didn't enter three winners.");
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
  Twitter.sendTextMessage(userId, 'Please, send the new winners in the following order : question-writing-random.');
  return userStatus.setStatus(userId, 'adding_winners');
}

function generateInvoice(params) {
  const { userId } = params;

  Twitter.sendTextMessage(userId, 'Thank you for choosing to tip Cryptodidacte');
  __('events.js@generateInvoice : Generating an invoice (tip) ');

  Twitter.sendTextMessage(userId, 'Generating invoice...');
  userStatus.setStatus(userId, 'generating_invoice');

  lightning.generateInvoice(200, 'Test', (invoice) => {
    Twitter.sendTextMessage(userId, '✅ Done!');

    QRCode.generateQRCode(invoice, (QRCodePath) => {
      __(`QRCodePath :${QRCodePath}`);
      if (QRCodePath !== 'None') {
        Twitter.sendMessageWithImage(userId, invoice, QRCodePath);
      } else {
        Twitter.sendTextMessage(userId, invoice);
      }

      end(params);
    });
  }, (err) => {
    __('events.js@generateInvoice : Could not generate invoice, got following', 9);
    __(err, 9);

    end(params, '❌ Error generating invoice... Please try later.');
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
          Twitter.sendTextMessage(userId, 'Paying invoice...');
          __('events.js@claimRewars : An invoice is being paid');

          lightning.payInvoice(invoice, () => {
            const db = new Database('cryptodidacte');
            db.remove('rewards', { userId: userId.toString() }, true);
            __('events.js@claimRewars : Reward paid, document(s) removed !', 2);

            //* ** TODO : Should I send message "end of action" ?***//
            return end(params, '✅ Paid!');
          }, (err) => {
          // Cannot pay invoice
            Twitter.sendTextMessage(userId, '❌ Error paying invoice... Please try again later.');
            __('Could not pay invoice, got following error : ', 9);
            __(err.payment_error, 9);
            return end(params, `Error log : ${err.payment_error}`);
          });
        } else {
        // / Amounts not corresponding
          return retry(params, `Your invoice is for ${result.num_satoshis.toString()} sats. Please generate an invoice for ${amount.toString()} sats.`);
        }
      },

      // / ERROR AT GETTING INVOICE DATA
      (err) => {
      //* * CANCELLATION (?) **/
        __("events.js@claimRewards:lightning.getInvoiceData : Couldn't get invoice data, got following error : ", 9);
        __(err, 9);
        return end(params, 'Could not get invoice data');
      });
  } else {
    return retry(params);
  }
}

function sendRewardsInfo(params) {
  const { userId } = params;
  Twitter.sendTextMessage(userId, `Current #LNQuiz Rewards :\n\n🏁 ${lnquiz.rewards.question} sats\n✍️ ${lnquiz.rewards.writing} sats \n🎲 ${lnquiz.rewards.random} sats`);
}

function updateRewards(params) {
  const { userId } = params;
  Twitter.sendTextMessage(userId, 'Please, send the new rewards ammounts in the following order : question-writing-random, separated with a space and in sats (e.g. "150 300 150").');
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

      end(params, '✅ Updated!', { endMessage: false });
      return sendRewardsInfo(params);
    });
  } else {
    // Not matching pattern
    return retry(params);
  }
}

function receiveSats(params) {
  end(params, 'You have chosen to receive sats');
}

function countRewards(params) {
  lnquiz.countRewards(params.userId, (amount) => {
    if (amount) {
      Twitter.sendTextMessage(params.userId, `Please, send an invoice for ${amount} sats.`);
      return userStatus.setStatus(params.userId, `claim_rewards_${amount}_sats`);
    }
    return end(params, 'You have nothing to claim.');
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
  receiveSats,
  generateInvoice,
  generatingInvoice,
  updateRewards,
  updatingRewards,
  sendRewardsInfo,
};
