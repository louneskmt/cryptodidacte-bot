const Twitter = require('../../Twitter.js');
const { sendTokens } = require('../../fidelity.js');
const { end } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');

async function sendCommand(params, args) {
  const { userId, messageData } = params;

  const mentions = messageData.entities.user_mentions;
  if (mentions.length > 1) return end(params, { description: messageTemplates.validators_errors.onlyOneRecipient });
  if (mentions.length === 0) return end(params, { description: messageTemplates.validators_errors.oneRecipient });

  const amount = args[0];
  if (!amount) {
    return end(params, { description: insertVariablesInTemplate(messageTemplates.fidelity.error, { err: messageTemplates.validators_errors.validAmount }) });
  }

  const from = await Twitter.getUserInfo({ userId });
  const to = mentions[0];

  if (from.id_str === to.id_str) return end(params, { description: insertVariablesInTemplate(messageTemplates.fidelity.error, { err: messageTemplates.validators_errors.noSelfSending }) });

  sendTokens(from, to, amount)
    .then((balance) => {
      Twitter.sendMessage(to.id_str, insertVariablesInTemplate(messageTemplates.fidelity.received, { sender: from.screen_name, amount }));
      end(params, { description: insertVariablesInTemplate(messageTemplates.fidelity.sendOk, { to: to.screen_name, amount, balance }) });
    })
    .catch((err) => end(params, { description: insertVariablesInTemplate(messageTemplates.fidelity.error, { err: err.message }) }));
}

module.exports = sendCommand;
