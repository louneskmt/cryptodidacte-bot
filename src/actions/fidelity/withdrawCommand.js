const Twitter = require('../../Twitter.js');
const { claimTokens, getLinkedAddress } = require('../../fidelity.js');
const { end } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');

async function withdraw(params, args) {
  const { userId } = params;

  const amount = args[0];
  const address = args[1] || await getLinkedAddress(userId);

  if (!amount || !address) {
    return end(params, insertVariablesInTemplate(messageTemplates.fidelity.claimError, { err: 'Please enter valid amount and address (if you haven\'t linked yet an Ethereum address to your Twitter account).' }));
  }

  claimTokens(userId, amount, address)
    .then((hash) => {
      Twitter.sendMessage(userId, insertVariablesInTemplate(messageTemplates.fidelity.claimOk, { hash }));
    })
    .catch((err) => {
      Twitter.sendMessage(userId, insertVariablesInTemplate(messageTemplates.fidelity.claimErr, { err }));
    });
  return end(params);
}

module.exports = withdraw;
