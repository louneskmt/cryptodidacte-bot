const Twitter = require('../../Twitter.js');
const { sendTokens } = require('../../fidelity.js');
const { end } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');

function sendCommand(params, args) {
  const { userId, messageData } = params;

  const mentions = messageData.user_mentions;
  if (mentions.length > 1) return end(params, { description: 'Please provide only one recipient.' });
  if (mentions.length === 0) return end(params, { description: 'Please provide one recipient.' });

  const amount = args[0];
  const from = { id_str: userId };
  const to = mentions[0];

  if (!amount) {
    return end(params, { description: insertVariablesInTemplate(messageTemplates.fidelity.error, { err: 'Please enter valid amount and retry.' }) });
  }

  sendTokens(from, to, amount)
    .then((result) => end(params, { description: insertVariablesInTemplate(messageTemplates.fidelity.sendOk, { to: to.screen_name, amount, balance: result.balance }) }))
    .catch((err) => end(params, { description: insertVariablesInTemplate(messageTemplates.fidelity.error, { err: err.message }) }));
}

module.exports = sendCommand;
