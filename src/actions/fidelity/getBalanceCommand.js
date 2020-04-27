const Twitter = require('../../Twitter.js');
const { end } = require('../global.js');
const { getBalance } = require('../../fidelity.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');


async function getBalanceCommand(params, args) {
  const { userId } = params;

  getBalance(userId)
    .then((balance) => {
      if (balance && balance !== 0) Twitter.sendMessage(userId, insertVariablesInTemplate(messageTemplates.fidelity.getBalance, { balance }));
      else Twitter.sendMessage(userId, messageTemplates.fidelity.getBalanceEmpty);
      end(params);
    });
}

module.exports = getBalanceCommand;
